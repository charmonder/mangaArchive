let loadMoreBtn = document.querySelector("#load-more");
let endMsg = document.querySelector("#end-message");
let currentItem = 3;

loadMoreBtn.onclick = () => {
  let cards = [...document.querySelectorAll(".search-results .card")];

  for (i = currentItem; i < currentItem + 3; i++) {
    if (cards[i]) {
      cards[i].style.display = "flex";
    }
  }

  currentItem += 3;

  if (currentItem >= cards.length) {
    loadMoreBtn.style.display = "none";
    endMsg.style.display = "block";
  }
};
