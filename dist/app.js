"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const letter_modal_1 = require("./components/letter-modal");
const birthday_scene_1 = require("./scenes/birthday-scene");

class App {
    constructor() {
        this.initialize();
    }

    initialize() {
        const sceneRoot = document.querySelector('[data-scene-root]');
        if (!sceneRoot) {
            return;
        }

        this.scene = new birthday_scene_1.BirthdayScene(sceneRoot);
        this.letterModal = new letter_modal_1.LetterModal();
        this.attachLetterCards();
        this.attachRevealEffects();
        this.attachScrollParallax();
        this.attachStoryButton(); // 👈 new method
    }

    attachLetterCards() {
        const cards = Array.from(document.querySelectorAll('[data-letter-card]'));
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-letter-title') || 'A love note';
                const content = card.getAttribute('data-letter-content') || 'A beautiful message will appear here.';
                this.letterModal.open({ title, content });
            });
        });
    }

    attachRevealEffects() {
        const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 120}ms`;
        });
    }

    attachScrollParallax() {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            document.body.style.setProperty('--scroll-progress', `${Math.min(scrollPosition / 500, 1)}`);
            this.scene.update(scrollPosition);
        });
    }

    // 🎵 New method for “Begin the story”
    attachStoryButton() {
        const storyLink = document.querySelector('.hero-link');
        if (storyLink) {
            storyLink.addEventListener('click', (event) => {
                event.preventDefault();

                // Smooth scroll to the story section
                const storySection = document.querySelector('#story');
                if (storySection) {
                    storySection.scrollIntoView({ behavior: 'smooth' });
                }

                // Trigger Spotify autoplay
                const spotifyFrame = document.querySelector('.spotify-player iframe');
                if (spotifyFrame) {
                    spotifyFrame.src += '&autoplay=1';
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
