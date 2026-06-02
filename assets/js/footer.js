let footerBtn = document.querySelector('[data-role="scroll-top"]');

footerBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
});
