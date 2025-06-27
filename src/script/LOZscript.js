const elementDisplayLOZSpecies = document.querySelector("#LOZ-species");
const elementDisplayLOZSections = document.querySelector("#LOZ-sections");
const elementLOZMap = document.querySelector("#LOZ-map");
const elementLOZReset = document.querySelector("#LOZ-reset");

const regions = [
  document.querySelector("#Podkarpackie"),
  document.querySelector("#Malopolskie"),
  document.querySelector("#Slaskie"),
  document.querySelector("#Opolskie"),
  document.querySelector("#Dolnoslaskie"),
  document.querySelector("#Swietokrzyskie"),
  document.querySelector("#Lubelskie"),
  document.querySelector("#Lodzkie"),
  document.querySelector("#Mazowieckie"),
  document.querySelector("#Wielkopolskie"),
  document.querySelector("#Lubuskie"),
  document.querySelector("#Kujawsko-Pomorskie"),
  document.querySelector("#Podlaskie"),
  document.querySelector("#Zachodniopomorskie"),
  document.querySelector("#Warminsko-Mazurskie"),
  document.querySelector("#Pomorskie"),
];

let globalCompareScalar = 0;

regions.forEach((element) => {
  //gdy klikniesz na woj.:
  element.addEventListener("click", function () {
    elementLOZMap.classList.add("hidden");
    elementDisplayLOZSections.classList.remove("hidden");
    document.querySelector("#LOZ-bottom-text").classList.add("hidden");

    //wyświetlanie grup gatunków
    displaySpeciesGroup(elementDisplayLOZSections);

    sectionsArr.forEach((section, index) => {
      //gdy klikniesz na grupę:
      document
        .getElementById(`section-${index}`)
        .addEventListener("click", function () {
          let section = sectionsArr[index];
          let files = filesArr[index];

          if (section !== "pozostale_wkrotce") {
            //tekst w sekcji LOZ
            displayLOZText(element.id);

            //wyświetlanie nazw gatunków
            displaySpecies(elementDisplayLOZSpecies, true, section, files);

            //mechanika działania kliknięcia
            functioningSpecies(section, files, element.id);
          }
        });
    });
  });
});

//mechanika przycisku resetuj
elementLOZReset.addEventListener("click", function () {
  elementLOZMap.classList.remove("hidden");
  elementDisplayLOZSections.classList.add("hidden");

  elementDisplayLOZSpecies.classList.add("hidden");
  document.querySelector("#LOZ-text").innerHTML = "Lista Odmian Zalecanych";
});
