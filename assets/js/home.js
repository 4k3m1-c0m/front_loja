// BANNER
let banners = document.querySelectorAll('[data-role="banner-area"] a');
let counters = document.querySelectorAll('[data-role="banner-counter"]');
let currentBanner = 0;
let bannerInterval;

counters.forEach((item, key) => {
    item.addEventListener('click', () => {
        currentBanner = key;
        showBanner(key);
        restartBannerTimer();
    });
});

restartBannerTimer();

function showBanner(n) {
    for (let banner of banners) {
        banner.classList.remove('z-10');
    }
    for (let counter of counters) {
        counter.classList.remove('opacity-100');
        counter.classList.add('opacity-30');
    }

    banners[n].classList.add('z-10');
    counters[n].classList.remove('opacity-30');
    counters[n].classList.add('opacity-100');
}

function restartBannerTimer() {
    clearInterval(bannerInterval);
    bannerInterval = setInterval(nextBanner, 2000);
}

function nextBanner() {
    if (currentBanner + 1 >= banners.length) {
        currentBanner = 0;
    } else {
        currentBanner++;
    }

    showBanner(currentBanner);
}
