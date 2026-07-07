import { LetterModal } from './components/letter-modal';
import { BirthdayScene } from './scenes/birthday-scene';

class App {
  private scene!: BirthdayScene;
  private letterModal!: LetterModal;
  private STORAGE_KEY = 'birthday_letters_v1';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const sceneRoot = document.querySelector('[data-scene-root]') as HTMLElement | null;
    this.letterModal = new LetterModal();
    this.attachLetterCards();
    this.attachRevealEffects();
    this.attachChapterRail();

    if (sceneRoot) {
      try {
        this.scene = new BirthdayScene(sceneRoot);
        this.attachScrollParallax();
      } catch (error) {
        console.warn('3D scene could not be initialized:', error);
      }
    }
  }

  private attachLetterCards(): void {
    const grid = document.getElementById('lettersGrid');
    if (!grid) return;

    type Letter = { id: string; title: string; content: string; sender: string };

    const loadLetters = (): Letter[] => {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Letter[];
          // Remove any legacy seeded letters we added earlier so only user letters remain
          const seededNames = ['Ava', 'Liam', 'Noah'];
          const filtered = parsed.filter((l) => !seededNames.includes(l.sender));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
          }
          return filtered;
        } catch {
          return [];
        }
      }

      // No stored letters; start with empty list (user adds letters)
      const initial: Letter[] = [];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
      return initial;
    };

    const saveLetters = (letters: Letter[]) => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(letters));
    };

    const createCard = (letter: Letter): HTMLElement => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'letter-card';
      card.setAttribute('data-letter-card', '');
      card.setAttribute('data-id', letter.id);
      card.setAttribute('data-letter-title', letter.title);
      card.setAttribute('data-letter-content', letter.content);
      card.setAttribute('data-letter-sender', letter.sender);

      card.innerHTML = `
        <div class="envelope" aria-hidden="false">
          <div class="envelope__flap" aria-hidden="true"></div>
          <div class="envelope__body" aria-hidden="true"></div>
          <div class="letter-add" role="button" title="Open letter" aria-label="Open letter">+</div>
          <div class="letter-remove" role="button" title="Remove letter" aria-label="Remove letter">×</div>
          <div class="envelope__sender">${letter.sender}</div>
        </div>
      `;

      return card;
    };

    const render = () => {
      const letters = loadLetters();
      grid.innerHTML = '';
      letters.forEach((l) => {
        grid.appendChild(createCard(l));
      });

      // append add button at end
      const addBtn = document.createElement('button');
      addBtn.id = 'addLetter';
      addBtn.className = 'letter-card letter-card--add';
      addBtn.setAttribute('aria-label', 'Add letter');
      addBtn.innerHTML = `<span class="letter-add__plus">+</span><span class="letter-add__label">Add</span>`;
      grid.appendChild(addBtn);
    };

    const showAddForm = (): Promise<Letter | null> => {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'letter-modal is-open';

        const content = document.createElement('div');
        content.className = 'letter-modal__content add-form';
        content.innerHTML = `
          <h3 class="letter-modal__title">Add a letter</h3>
          <label class="input-group">Name on envelope<br><input id="__add_name" class="add-input" /></label>
          <label class="input-group">Letter content<br><textarea id="__add_content" rows="6" class="add-textarea"></textarea></label>
          <div class="form-actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
            <button id="__add_cancel" class="letter-modal__close">Cancel</button>
            <button id="__add_save" class="letter-modal__close">Save</button>
          </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // make overlay focusable for keyboard handling
        overlay.tabIndex = -1;
        overlay.focus();

        const cancelBtn = content.querySelector('#__add_cancel') as HTMLButtonElement;
        const saveBtn = content.querySelector('#__add_save') as HTMLButtonElement;
        const nameInput = content.querySelector('#__add_name') as HTMLInputElement;
        const textarea = content.querySelector('#__add_content') as HTMLTextAreaElement;

        cancelBtn.addEventListener('click', () => { cleanup(); resolve(null); });
        saveBtn.addEventListener('click', () => {
          const name = nameInput.value.trim();
          const txt = textarea.value.trim();
          const newLetter: Letter = { id: String(Date.now()), title: name ? `${name}'s letter` : 'A new letter', content: txt || '', sender: name || '' };
          cleanup();
          resolve(newLetter);
        });

        // focus and keyboard handling
        nameInput.focus();
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Escape') { cleanup(); resolve(null); }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { saveBtn.click(); }
        };
        overlay.addEventListener('keydown', onKey);

        const cleanup = () => { overlay.removeEventListener('keydown', onKey); overlay.remove(); };
      });
    };

    // Initial render
    render();

    // Delegated handlers
    grid.addEventListener('click', async (ev) => {
      const target = ev.target as HTMLElement;
      // remove
      const removeBtn = target.closest('.letter-remove') as HTMLElement | null;
      if (removeBtn) {
        const card = removeBtn.closest('[data-letter-card]') as HTMLElement | null;
        if (!card) return;
        const id = card.getAttribute('data-id');
        if (!id) return;
        // confirmation
        const ok = window.confirm('Remove this letter? This cannot be undone.');
        if (!ok) return;
        const letters = loadLetters().filter((l) => l.id !== id);
        saveLetters(letters);
        render();
        return;
      }

      // add
      const addBtn = target.closest('#addLetter, .letter-card--add') as HTMLElement | null;
      if (addBtn) {
        const created = await showAddForm();
        if (created) {
          const letters = loadLetters();
          letters.push(created);
          saveLetters(letters);
          render();
        }
        return;
      }

      // open letter (click on plus or card)
      const openBtn = target.closest('.letter-add') as HTMLElement | null;
      const cardEl = (target as HTMLElement).closest('[data-letter-card]') as HTMLElement | null;
      const card = openBtn ? openBtn.closest('[data-letter-card]') as HTMLElement | null : cardEl;
      if (!card) return;

      const id = card.getAttribute('data-id');
      const letters = loadLetters();
      const letter = id ? letters.find((l) => l.id === id) : null;
      const title = letter?.title || card.getAttribute('data-letter-title') || 'A love note';
      const content = letter?.content || card.getAttribute('data-letter-content') || '';
      const sender = letter?.sender || card.getAttribute('data-letter-sender') || '';

      // flap animation
      card.classList.add('is-opening');
      const ANIM_DURATION = 520;
      window.setTimeout(() => {
        card.classList.remove('is-opening');
        card.classList.add('is-opened');
        const full = sender ? `${content}\n\n— ${sender}` : content;
        this.letterModal.open({ title, content: full });
      }, ANIM_DURATION);
    });
  }
  private attachRevealEffects(): void {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    const updateRevealState = () => {
      const viewportHeight = window.innerHeight;

      revealItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const isVisible = rect.top < viewportHeight * 0.82 && rect.bottom > 0;
        item.style.transitionDelay = `${index * 140}ms`;
        item.classList.toggle('is-visible', isVisible);
      });
    };

    window.addEventListener('scroll', updateRevealState, { passive: true });
    window.addEventListener('resize', updateRevealState);
    updateRevealState();
  }

  private attachChapterRail(): void {
    const rail = document.querySelector<HTMLElement>('.chapter-rail');
    const markersContainer = document.querySelector<HTMLElement>('.chapter-rail__markers');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter-section]'));

    if (!rail || !markersContainer || sections.length === 0) {
      return;
    }

    sections.forEach((section, index) => {
      const marker = document.createElement('div');
      marker.className = 'chapter-rail__marker';
      marker.style.top = `${index === 0 ? 0 : index === sections.length - 1 ? 100 : (index / (sections.length - 1)) * 100}%`;
      markersContainer.appendChild(marker);
    });

    const markers = Array.from(markersContainer.querySelectorAll<HTMLElement>('.chapter-rail__marker'));

    const updateRail = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
      rail.style.setProperty('--progress', `${progress * 100}%`);

      const activeIndex = sections.reduce((closestIndex, section, index) => {
        const distance = Math.abs(window.scrollY + window.innerHeight * 0.28 - section.offsetTop);
        const closestDistance = Math.abs(window.scrollY + window.innerHeight * 0.28 - sections[closestIndex].offsetTop);
        return distance < closestDistance ? index : closestIndex;
      }, 0);

      markers.forEach((marker, index) => {
        marker.classList.toggle('is-active', index <= activeIndex);
      });
    };

    window.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();
  }

  private attachScrollParallax(): void {
    const updateParallax = () => {
      const scrollPosition = window.scrollY;
      const scrollProgress = Math.min(scrollPosition / 500, 1);
      document.body.style.setProperty('--scroll-progress', `${scrollProgress}`);
      document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}`);

      if (this.scene) {
        this.scene.update(scrollPosition);
      }
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});