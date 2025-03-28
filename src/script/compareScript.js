document.addEventListener("click", function (event) {
  if (event.target.classList.contains("compare")) {
    let id = event.target.id.replace("-button", "").replace("-span", "");
    const element = document.querySelector("#" + id + "-span");
    const elementBorder = document.querySelector("#" + id + "-border");
    //czy zaznaczone
    if (element.classList.contains("to-compare")) {
      element.classList.remove("to-compare");
      elementBorder.classList.remove("compare-border");

      row = Array.from(event.target.closest("tr").querySelectorAll("td")).map((cell) => cell.textContent.trim());
      compareObj.removeRow(row);
    } else {
      element.classList.add("to-compare");
      elementBorder.classList.add("compare-border");

      row = Array.from(event.target.closest("tr").querySelectorAll("td")).map((cell) => cell.textContent.trim());
      compareObj.addRow(row);
    }
  }
});

class Compare {
  //konstruktor
  constructor(elementId, colNames, file, groupOfSpecies, files, isLOZ) {
    this.colNames = [...colNames];
    this.firstTimeRender = false;
    this.file = file;
    this.groupOfSpecies = groupOfSpecies;
    this.files = files;
    this.num = isLOZ ? 1 : 0;
    this.num += file === "owies_jary.json" ? -6 : 0;
    this.num += file === "ziemniak.json" ? -10 : 0;
    this.num += file === "groch.json" ? -10 : 0;
    this.num += file === "bobik.json" ? -10 : 0;
    this.num += file === "kukurydza_ziarno.json" ? -10 : 0;
    this.num += file === "kukurydza_kiszonka.json" ? -10 : 0;
    this.num += file === "lubin_bialy.json" ? -10 : 0;
    this.num += file === "lubin_zolty.json" ? -10 : 0;
    this.num += file === "lubin_waskolistny.json" ? -10 : 0;
    this.num += file === "soja.json" ? -10 : 0;
    const index = this.colNames.indexOf("Rok wyników:");
    if (index !== -1) this.colNames.splice(index, 1);

    this.rowsToCompare = [];
    this.element = document.querySelector(`#${elementId}`);
  }
  //wyświetlanie porównywarki
  displayCompare() {
    if (this.rowsToCompare.length < 2) {
      this.element.innerHTML = `<p class="text-2xl text-top-agrar-green text-center text-wrap">Dodaj odmianę do porównania - kliknij ikonę<i class="icon-balance-scale pr-2 pl-1"></i>przy odmianie</p>`;
    } else {
      let name = "";
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i] == this.file) {
          name = this.groupOfSpecies[i].toLowerCase();
          break;
        }
      }

      document.querySelector("#compare-text").innerHTML = `<span class="text-wrap">Porównywanie odmian: ${name} (by porównać więcej odmian przewiń wyżej i<p class="text-nowrap"> kliknij:<i class="icon-balance-scale"></i>)</p> <span>`;

      if (!this.firstTimeRender) {
        this.firstTimeRender = true;
        document.querySelector("#compare-text").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      let table = '<div class="compare-table">';
      for (let i = 0; i < this.rowsToCompare[0].length - globalCompareScalar; i++) {
        table += '<div class="compare-row">';
        table += `<div class="compare-name">${this.colNames[i]}</div><div class="compare-scrolling">`;
        for (let j = 0; j < this.rowsToCompare.length; j++) {
          table += `<div class="compare-cell">${this.rowsToCompare[j][i]}</div>`;
        }
        table += "</div></div>";
      }
      table += "</div>";

      this.element.innerHTML = table;

      // let screenWidth = screen.width;
      // screenWidth > 768 ? (screenWidth *= 8 / 12) : (screenWidth *= 11 / 12);
      // document.querySelectorAll(".compare-cell").forEach((cell) => {
      //   cell.style.width = (screenWidth - 224) / this.rowsToCompare.length + "px";
      // });

      const scrollingElement = document.querySelector(".compare-row:first-child .compare-scrolling");
      if (scrollingElement.scrollWidth > scrollingElement.clientWidth) {
        scrollingElement.style.overflowX = "auto";
      } else {
        scrollingElement.style.overflowX = "hidden";
      }

      this.synchronizeScrolling();
    }
  }

  //łączenie wierszy by się razem przesuwały
  synchronizeScrolling() {
    const scrollingElements = document.querySelectorAll(".compare-scrolling");
    scrollingElements.forEach((scrollingElement) => {
      scrollingElement.addEventListener("scroll", (event) => {
        const scrollLeft = event.target.scrollLeft;
        scrollingElements.forEach((el) => {
          if (el !== event.target) {
            el.scrollLeft = scrollLeft;
          }
        });
      });
    });
  }

  //dodawanie wiersza do porównywarki
  addRow(row) {
    const fragmentRow = row.slice(0, -11 - this.num);

    this.rowsToCompare.push(fragmentRow);
    this.displayCompare();
  }

  //usunięcie wiersza z porównywarki
  removeRow(row) {
    const fragmentRow = row.slice(0, -11 - this.num);

    const index = this.rowsToCompare.findIndex((r) => JSON.stringify(r) === JSON.stringify(fragmentRow));
    if (index !== -1) {
      this.rowsToCompare.splice(index, 1);
    }
    this.displayCompare();
  }
}
