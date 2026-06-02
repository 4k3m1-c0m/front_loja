let menuBurger = document.querySelector('[data-role="menu-burger"]');
let headerMenu = document.querySelector('[data-role="header-menu"]');
let iconOff = menuBurger.querySelector('[data-role="icon-off"]');
let iconOn = menuBurger.querySelector('[data-role="icon-on"]');

menuBurger.addEventListener('click', () => {
    let isHidden = headerMenu.classList.contains('hidden');

    headerMenu.classList.toggle('hidden', !isHidden);
    headerMenu.classList.toggle('block', isHidden);
    menuBurger.classList.toggle('bg-[#1D4FFE]', isHidden);
    iconOff.classList.toggle('hidden', isHidden);
    iconOn.classList.toggle('hidden', !isHidden);
});
