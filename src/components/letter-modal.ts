export class LetterModal {
  private modalElement: HTMLDivElement;
  private modalContent: HTMLDivElement;
  private closeButton: HTMLButtonElement;

  constructor() {
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'letter-modal';

    this.modalContent = document.createElement('div');
    this.modalContent.className = 'letter-modal__content';

    this.closeButton = document.createElement('button');
    this.closeButton.className = 'letter-modal__close';
    this.closeButton.textContent = 'Close';
    this.closeButton.addEventListener('click', () => this.close());

    this.modalElement.addEventListener('click', (event) => {
      if (event.target === this.modalElement) {
        this.close();
      }
    });

    this.modalElement.appendChild(this.modalContent);
    this.modalContent.appendChild(this.closeButton);
    document.body.appendChild(this.modalElement);
    this.close();
  }

  public open({ title, content }: { title: string; content: string }): void {
    this.modalContent.innerHTML = '';
    this.modalContent.appendChild(this.createHeader(title));
    this.modalContent.appendChild(this.createBody(content));
    this.modalContent.appendChild(this.closeButton);
    this.modalElement.classList.add('is-open');
  }

  public close(): void {
    this.modalElement.classList.remove('is-open');
  }

  private createHeader(title: string): HTMLHeadingElement {
    const heading = document.createElement('h3');
    heading.className = 'letter-modal__title';
    heading.textContent = title;
    return heading;
  }

  private createBody(content: string): HTMLParagraphElement {
    const paragraph = document.createElement('p');
    paragraph.className = 'letter-modal__body';
    paragraph.textContent = content;
    return paragraph;
  }
}

export default LetterModal;