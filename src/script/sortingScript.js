const elementDisplayFilesName = document.querySelector("#displayFilesName");
const elementDisplaySectionsName = document.querySelector(
  "#displaySectionsName"
);
const elementDisplaySettings = document.querySelector("#settings");
elementDisplayFilesName.classList.add("hidden");
elementDisplaySettings.classList.add("hidden");

const elementType1Container = document.querySelector("#type1-container");
const elementType2Container = document.querySelector("#type2-container");
const elementType3Container = document.querySelector("#type3-container");
elementType1Container.classList.add("hidden");
elementType2Container.classList.add("hidden");
elementType3Container.classList.add("hidden");

//przesunięcie przy odświerzeniu
document.querySelector("body").scrollIntoView({
  behavior: "smooth",
  block: "start",
});

//grupy odmian
displaySpeciesGroup(elementDisplaySectionsName);

names_section.forEach((groupKey, index) => {
  //gdy klikniesz na grupę:
  document
    .getElementById(`section-${index}`)
    .addEventListener("click", function () {
      let section = groups[groupKey].map((s) => s.name);
      let files = groups[groupKey].map((s) => s.file_name);

      if (groupKey !== "pozostale_wkrotce") {
        displaySpecies(elementDisplayFilesName, false, section, files);

        functioningSpecies(section, files);
      }
    });
});

//mechanika przycisku resetuj
const elementSortReset = document.querySelector("#sort-reset");
elementSortReset.addEventListener("click", function () {
  elementDisplayFilesName.classList.add("hidden");
  elementDisplaySettings.classList.add("hidden");
  elementDisplaySectionsName.classList.remove("hidden");
});

function displayFilters(file) {
  elementDisplaySettings.classList.remove("hidden");

  // Reset and hide previous filters
  document.querySelector("#type1").innerHTML = "";
  document.querySelector("#type2").innerHTML = "";
  document.querySelector("#type3").innerHTML = "";
  document.querySelector("#yearFilter").innerHTML = "";
  document.querySelector("#sorting").innerHTML = "";

  elementType1Container.classList.add("hidden");
  elementType2Container.classList.add("hidden");
  elementType3Container.classList.add("hidden");

  table.search("").columns().search("").draw();

  //filtr typ1
  const elementType1 = document.querySelector("#type1");
  const meta = species_meta[file.replace(".json", "")];
  if (meta?.type1) {
    elementType1Container.classList.remove("hidden");
    document.querySelector("#type1-name").innerHTML = meta.type1_name;

    let types1 = '<option value="-">wszystkie</option>';
    for (const type of meta.type1) {
      types1 += `<option value="${type}">${type}</option>`;
    }
    elementType1.innerHTML = types1;

    elementType1.onchange = function () {
      let selectedType1 = elementType1.value;
      table
        .columns(8)
        .search(selectedType1 === "-" ? "" : `^${selectedType1}$`, true)
        .draw();
    };
  }

  //filtr typ2
  const elementType2 = document.querySelector("#type2");
  if (meta?.type2) {
    elementType2Container.classList.remove("hidden");
    document.querySelector("#type2-name").innerHTML = meta.type2_name;

    let types2 = '<option value="-">wszystkie</option>';
    for (const type of meta.type2) {
      types2 += `<option value="${type}">${type}</option>`;
    }
    elementType2.innerHTML = types2;

    elementType2.onchange = function () {
      let selectedType2 = elementType2.value;
      table
        .columns(9)
        .search(selectedType2 === "-" ? "" : `^${selectedType2}$`, true)
        .draw();
    };
  }

  //filtr typ3
  const elementType3 = document.querySelector("#type3");
  if (meta?.type3) {
    elementType3Container.classList.remove("hidden");
    document.querySelector("#type3-name").innerHTML = meta.type3_name;

    let types3 = '<option value="-">wszystkie</option>';
    for (const type of meta.type3) {
      types3 += `<option value="${type}">${type}</option>`;
    }
    elementType3.innerHTML = types3;

    elementType3.onchange = function () {
      let selectedType3 = elementType3.value;
      table
        .columns(10)
        .search(selectedType3 === "-" ? "" : `^${selectedType3}$`, true)
        .draw();
    };
  }

  //filtr rok
  const elementYearFilter = document.querySelector("#yearFilter");
  if (meta?.years) {
    let years = "";
    for (const year of meta.years) {
      years += `<option value="${year}">${year}</option>`;
    }
    elementYearFilter.innerHTML = years;

    elementYearFilter.onchange = function () {
      let selectedYear = elementYearFilter.value;
      table.columns(1).search(selectedYear).draw();
    };

    let selectedYear = elementYearFilter.value;
    table.columns(1).search(selectedYear).draw();
  }

  //sortowanie
  const colNames = species_columns[file.replace(".json", "")]?.map(
    (c) => c.col_name
  );
  if (colNames) {
    const elementSorting = document.querySelector("#sorting");
    let sortOptions = "";

    for (const element of colNames.slice(0, -17)) {
      if (element !== "Rok wyników:") {
        sortOptions += `<option value="${element.replace(
          ":",
          ""
        )}">${element.replace(":", "")}</option>`;
      }
    }
    elementSorting.innerHTML = sortOptions;

    elementSorting.onchange = function (event) {
      let sortingIndex = colNames
        .slice(0, -17)
        .indexOf(event.target.value + ":");

      if (sortingIndex !== -1) {
        displayFilesValues(
          file,
          -1,
          "Brak wyników dla podanych ustawień",
          sortingIndex,
          false
        );
        let sortingIndexName = colNames[sortingIndex];
        if (
          sortingIndexName === "Werticilioza:" ||
          sortingIndexName === "Zgn. twardzikowa:" ||
          sortingIndexName === "Sucha zgnilizna:" ||
          sortingIndexName === "Choroby pods. łodygi:"
        ) {
          table
            .order([sortingIndex, sortingIndex === 0 ? "desc" : "asc"])
            .draw();
        } else {
          table
            .order([sortingIndex, sortingIndex === 0 ? "asc" : "desc"])
            .draw();
        }
        table.columns(1).search(elementYearFilter.value).draw();
        if (elementType1.value !== "-")
          table.columns(8).search(elementType1.value).draw();
        if (elementType2.value !== "-")
          table.columns(9).search(elementType2.value).draw();
        if (elementType3.value !== "-")
          table.columns(10).search(elementType3.value).draw();
      }

      document.querySelector("#settings").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
  }
}
