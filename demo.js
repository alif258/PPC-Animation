const images = document.querySelectorAll(".timeline-image");
const contents = document.querySelectorAll(".timeline-content-item");
const dots = document.querySelectorAll(".dot");
const progLine = document.querySelector(".timeline-line-progress");
const section = document.getElementById("tergeting-section");
const scrollArea = document.getElementById("contentScroll");
const innerList = scrollArea ? scrollArea.querySelector(".timeline-inner-list") : null;

const totalSteps = dots.length;
let currentStep = -1;
let ticking = false;

const isMobile = () => window.innerWidth <= 900;

function scrollToItem(index) {
  if (!innerList || !contents[index]) return;
  const item = contents[index];
  const areaHeight = scrollArea.clientHeight;
  const target = item.offsetTop - (areaHeight / 2) + (item.offsetHeight / 2);
  const maxScroll = innerList.scrollHeight - areaHeight;
  innerList.style.transform = `translateY(-${Math.max(0, Math.min(target, maxScroll))}px)`;
}

function activateStep(index) {
  if (index < 0 || index >= totalSteps || index === currentStep) return;
  const prev = currentStep;
  currentStep = index;

  images.forEach((img, i) => {
    if (i === prev && prev !== -1) {
      img.classList.remove("active");
      img.classList.add("leaving");
      setTimeout(() => img.classList.remove("leaving"), 700);
    } else if (i === index) {
      img.classList.remove("leaving", "active");
      void img.offsetWidth; // Trigger reflow
      img.classList.add("active");
    } else {
      img.classList.remove("active", "leaving");
    }
  });

  contents.forEach((item, i) => {
    item.style.opacity = i === index ? "1" : "0.3";
    item.classList.toggle("active", i === index);
  });

  scrollToItem(index);

  dots.forEach((dot, i) => {
    dot.classList.toggle("isFinished", i < index);
    dot.classList.toggle("active", i === index);
  });

  const pct = (index / (totalSteps - 1)) * 100;
  if (isMobile()) {
    progLine.style.width = pct + "%";
    progLine.style.height = "100%";
  } else {
    progLine.style.height = pct + "%";
    progLine.style.width = "100%";
  }
}

function onScroll() {
  if (!section || ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // সেকশনটি যখন ভিউপোর্টের ভেতরে থাকবে
    if (rect.top <= 0 && rect.bottom >= 0) {
      const totalSectionHeight = section.offsetHeight;
      const scrollableDist = totalSectionHeight - windowHeight;
      
      // প্রগ্রেস বের করা (০ থেকে ১)
      let progress = Math.abs(rect.top) / scrollableDist;
      progress = Math.max(0, Math.min(1, progress));

      // হালকা স্ক্রলে রেসপন্স করার জন্য logic
      // এখানে progress-কে স্টেপ সংখ্যা দিয়ে গুণ করা হয়েছে
      let newStep = Math.floor(progress * totalSteps);
      
      // বাউন্ডারি চেক
      const safeStep = Math.min(totalSteps - 1, Math.max(0, newStep));

      if (safeStep !== currentStep) {
        activateStep(safeStep);
      }
    }
    ticking = false;
  });
}

dots.forEach((dot, i) => dot.addEventListener("click", () => activateStep(i)));
contents.forEach((item, i) => item.addEventListener("click", () => activateStep(i)));
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => scrollToItem(currentStep));

// Initial call
activateStep(0);