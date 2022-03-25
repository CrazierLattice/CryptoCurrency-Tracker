//Declaring few global variables :

//This array is used to store the cached info from a specific coin and deleting it after 2 minutes
let moreInfoArray = [];
//This array is used to contain 100 elements out of the api
let newCoinsArr = [];

// checkedSliders is an array of objects, each objects represents a coin that the user checked with the slider checkbox.
//The object contains the coin name, coin id and the coin symbol.
let checkedSliders = [];

$(() => {
  //Initialize the website on load.
  initCoins();
});

/**
 * searchFilter function will filter out the cards that their symbol does not match the input's value,
 * and also  resets the input's value on click, and displays all cards..
 */
let searchFilter = (e) => {
  let filter = $("#search-input").val().toUpperCase();
  let card = $(".card");
  let cardText = $(".card-title");
  for (let i = 0; i < cardText.length; i++) {
    if (cardText.eq(i).html().toUpperCase().indexOf(filter) > -1) {
      card.eq(i).show();
    } else {
      card.eq(i).hide();
    }
  }
  $("#search-input").on("click", (e) => {
    $("#search-input").val("");
    card.css("display", "");
  });
};

/**
 * Functoin that shows some information about me :)
 */
showPersonalInfo = () => {
  $(".personal-info").show();
  $(".cards-container").css("display", "none");
  $("#chartContainer").css("display", "none");
};

/**
 * Function that initializes the website in 2 ways :
 * 1.If the user entered the website for the first time, this function will call the coin list API,
 * create a new array with a maximum of 100 coins and create a card for each coin.
 * 2.If the user has already initialized the website and is clicking on 'Home' button, the function will make the hidden cards displayable again.
 */
initCoins = () => {
  $(".personal-info").hide();
  $(".cards-container").show();
  let card = $(".card");
  if (card.length == 100) {
    for (let i = 0; i < card.length; i++) {
      if (card.eq(i).css("display", "none")) {
        card.eq(i).css("display", "");
      }
    }
  } else {
    $.get("https://api.coingecko.com/api/v3/coins/list", (coinListArr) => {
      for (let i = 741; i < 841; i++) {
        newCoinsArr.push(coinListArr[i]);
      }
      drawCard(newCoinsArr);
    }).fail(() => {
      $("#loading").remove();
      $("#error").css("display", "block");
      $(".container").empty();
    });
  }
  $("#search-input").val("");

  $("#chartContainer").css("display", "none");
};
/**
 * Function that will draw a card for each element in the coinsArray.
 * @param {Array} coinsArray - The new array that contains 100 coins.
 */
let drawCard = (coinsArray) => {
  for (let i = 0; i < coinsArray.length; i++) {
    let card = $(`<div></div>`).addClass("card");
    let cardBody = $("<div></div>").addClass("card-body");
    let labelSwitch = $("<label></label>").attr({
      class: "switch",
      id: `label${coinsArray[i].id}`,
      checked: false,
    });
    let sliderSpan = $("<span></span>").addClass("slider round");
    let coinSymbol = $("<p></p>")
      .addClass("card-text")
      .text(coinsArray[i].name)
      .attr("id", coinsArray[i].symbol);
    let coinName = $("<p></p>")
      .text(coinsArray[i].symbol)
      .addClass("card-title");
    let checkBoxInp = $("<input>").attr({
      type: "checkbox",
      class: "checkbox-input",
    });
    let infoBTN = $("<button></button>")
      .addClass("btn btn-warning text-white btn-sm card-button")
      .attr({
        "data-toggle": "collapse",
        "data-target": `#collapse${coinsArray[i].id}`,
        id: coinsArray[i].id,
      })
      .text("Show More Info")
      .on("click", (e) => {
        collapseDiv(e);
      });
    let loadingMoney = $("<div></div>").addClass("loading-money");
    let moreInfo = $("<div></div>")
      .attr({
        id: "collapse" + coinsArray[i].id,
        class: "collapse money",
      })
      .append(loadingMoney);
    labelSwitch.append(checkBoxInp, sliderSpan);
    cardBody.append(labelSwitch, coinName, coinSymbol, infoBTN, moreInfo);
    card.append(cardBody);
    $(".cards-container").append(card);
  }
  if (!$(window).ready) {
    $("#loading").show();
  } else {
    setTimeout(() => {
      $("#loading").fadeOut("4000");
      $(".container").fadeIn("4000");
      $(".parallax").fadeIn("4000");
    }, 1500);
  }
  $(".slider").on("click", sliderCounter);
};

/**
 *
 *  This function calls the second API of a specific coin by the ID of the targeted button clicked,
 * and showing them with a collapse effect when clicking on "Show More Info" button.
 */

let collapseDiv = (e) => {
  //Creating the loading gif
  const collapsedDiv = $(e.target.parentElement.childNodes[4]);
  if ($(e.target).html() != "Show More Info") {
    $(e.target).html("Show More Info");
  } else {
    let cachedCoin = getCachedCoin(moreInfoArray, e.target.id);
    if (!cachedCoin) {
      $.get(
        `https://api.coingecko.com/api/v3/coins/${e.target.id}`,
        (coinObject) => {
          let coin = {
            id: coinObject.id,
            usd: coinObject.market_data.current_price.usd,
            eur: coinObject.market_data.current_price.eur,
            ils: coinObject.market_data.current_price.ils,
            img: coinObject.image.small,
            name: coinObject.name,
          };
          moreInfoArray.push(coin);
          removeCoinsFromCache(moreInfoArray, e.target.id);
          if (!coin.usd && !coin.eur && !coin.eur) {
            collapsedDiv.html("No data available for this coin.");
          } else {
            setTimeout(() => {
              displayCoinsValues(collapsedDiv, coin);
              $(e.target).html("Show Less Info");
            }, 500);
          }
        }
      ).fail(() => {
        $("#error").css("display", "block");
        $(".container").empty();
      });
    } else {
      displayCoinsValues(collapsedDiv, cachedCoin);
      $(e.target).html("Show Less Info");
    }

    if (!collapsedDiv.ready()) {
      collapsedDiv.show(`<div class="loading-money"></div>`);
      $("#navbar").css("display", "none");
    }
  }
};
/**
 * Iterates through the infoArray and compares an the IDs inside the array
 * to the given coinID parameter.
 * If it matches - assigns the matched item to the cachedCoin variable.
 *
 * @param {Array} infoArray - The array which saves the data from the second API called.
 * @param {String} coinID  - The string which represents the coin id of a specific card.
 */

let getCachedCoin = (infoArray, coinID) => {
  let cachedCoin;
  infoArray.forEach((item) => {
    if (item.id == coinID) {
      cachedCoin = item;
    }
  });
  return cachedCoin;
};

/**
 * Function that draws the collapsed div when clicking on 'Show More Info' button.
 * @param {String} collapsedDiv - Represents the content of the collapsed div
 * @param {String} cachedCoin - Represents a coin that exists in the user's local cache.
 */

let displayCoinsValues = (collapsedDiv, cachedCoin) => {
  collapsedDiv.html(`USD: ${cachedCoin.usd} &#36;<br>
    EUR: ${cachedCoin.eur} &#8364;<br>
    ILS: ${cachedCoin.ils} &#8362
    <img class="coin-image" src="${cachedCoin.img}"alt="${cachedCoin.name}'s Image">`);
};

/**
 *  Iterates through the given Array, comparing the given coinID with the item.id
 * inside the array, and removing from cache after 2 minutes.
 * @param {Array} moreInfo - The array that contains the coins saved in the user's local cache.
 * @param {String} coinID  - The string which represents the coin id of a specific card.
 */

let removeCoinsFromCache = (moreInfo, coinID) => {
  setTimeout(() => {
    moreInfo.forEach((item, i) => {
      if (item.id == coinID) {
        cachedCoin = item;
        moreInfo.splice(i, 1);
      }
    });
  }, 120000);
};

/**
 *
 * @param {e} e  - used to target the clicked sliders and use their values
 * The following function is used to counter each slider checkbox that the used checked, and pushes its value to the checkedSliders array.
 * sliderCounter funciton will also alert the user with an alert popup if he has checked more than 5 coins.
 */

let sliderCounter = (e) => {
  let checkbox = $(e.target).parent()[0].childNodes[0];
  let sliderTitle = $(e.target.parentElement.parentNode.childNodes[2]).html();
  let sliderId = $(e.target).parent().attr("id");
  let sliderSymbol = $(e.target).parent().siblings().eq(1).attr("id");

  let sliderObj = {
    name: sliderTitle,
    id: sliderId,
    symbol: sliderSymbol,
  };

  //If a user unchekcs a slider - it will remove the unchecked slider from the checkedSliders array.
  if ($(checkbox).prop("checked")) {
    checkedSliders.forEach((object) => {
      if (object.name == sliderTitle) {
        spliceArray(checkedSliders, object);
      }
    });
  } else {
    //For each slider that the user checks, it will push its values to the checkedSliders array, only if the array's length is less than 7.
    if (checkedSliders.length < 7) {
      checkedSliders.push(sliderObj);
    }
    /**
     If the user checked 6 sliders -
     pop up the modal with the checked sliders,
     and an message that will ask the user to uncheck one of the coins in order to procced to the live reports.
     */
    if (checkedSliders.length == 6) {
      drawModalElements(
        checkedSliders,
        checkedSliders[5],
        `You can check up to a maximum of 5 coins, please
            uncheck one of your coins.`
      );
    }

    /**
     If the user does not check any coins and click on the 'Close' button on the modal,
     and then tries to check another coin, it will prevent the default effect of the modal slider effect
     remove the clicked slider values from the array and show the user the modal with the same message before.
     */
    if (checkedSliders.length > 6) {
      checkedSliders.pop();
      e.preventDefault();
      drawModalElements(
        checkedSliders,
        checkedSliders[5],
        `You can check up to a maximum of 5 coins, please
            uncheck one of your coins.`
      );
    }
  }
};

/**
 *
 * @param {Array} sliderArray - Iterates over the checked cards and draw their names and their checkboxs on the modal.
 * @param {Element} sixthSlider - The sixth element in the array that triggers the modal pop up when checked, and draw his name and checkbox.
 * @param {String} msg - Changes the modal title according to what triggered the modal.
 */
let drawModalElements = (sliderArray, sixthSlider, msg) => {
  $(".modal-body").empty();
  $("#modal").modal("show");
  //   $("#modal").modal().show();
  $(".modal-title").text(msg);
  sliderArray.forEach((sliderObj) => {
    let sliderContainer = $("<div></div>");
    let sliderLabel = $("<label></label>")
      .addClass("switch-modal")
      .attr("id", sliderObj.id);
    let sliderInp = $("<input>")
      .attr({
        type: "checkbox",
        checked: "true",
      })
      .addClass("modal-inp");
    sliderSpan = $("<span></span>").addClass("modal-span slider round");
    sliderLabel.append(sliderInp, sliderSpan);
    let sliderName = $("<h5></h5>")
      .addClass("slider-title")
      .append(
        `${sliderObj.name} (${sliderObj.symbol.toUpperCase()})`,
        sixthSlider
      )
      .attr("id", sliderObj.symbol);
    sliderContainer.append(sliderName, sliderLabel).addClass("modal-slider");

    $(sliderInp).click(function (e) {
      modalSlidersHandler(e);
    });

    $(".modal-body").append(sliderContainer);
  });

  /**
   * Fetches the checked sliders symbols
   * alerts the user which coins he need to uncheck  if the  API does not recognize that coin.
   */
  $("#live-reports").on("click", () => {
    //canvasLink -  The array that will be used as the parameters in the API link.
    let canvasLink = new Array();

    //currenciesObjectsArray - Array that will store the object of each coin that the api successfully fetched, and store it.
    let currenciesObjectsArray = new Array();

    // validCoins - array that will get the symbol from each object in the currenciesObjectsArray
    let validCoins = new Array();

    // uniqueCoins - an array used to store the valid coins but remove the duplicated symbols.
    let uniqueCoins = new Array();

    //Array that will store the coins that the API does not recognize and will display those arrays in the modal later
    // on in order to alert the user that he has to uncheck them to procced to the live reports..
    let filteredElements = new Array();
    if (checkedSliders.length == 6) {
      drawModalElements(
        checkedSliders,
        checkedSliders[5],
        `You can check up to a maximum of 5 coins, please uncheck one of your coins in order to procced to the live reports.`
      );
    } else if (checkedSliders.length <= 5) {
      for (let i = 0; i < checkedSliders.length; i++) {
        canvasLink.push(checkedSliders[i].symbol);
      }
      $.get(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${canvasLink.join()}&tsyms=USD`,
        (currencies) => {
          let upperCasedLink = canvasLink.map((link) => link.toUpperCase());
          for (const symbol in currencies) {
            if (currencies.hasOwnProperty(symbol)) {
              let currency = {
                symbol: symbol,
                usd: currencies[symbol],
              };
              currenciesObjectsArray.push(currency);
            }
          }
          upperCasedLink.forEach((coin) => {
            currenciesObjectsArray.forEach((secondCoin) => {
              if (coin !== secondCoin) {
                validCoins.push(secondCoin.symbol);
              }
            });
          });
          $.each(validCoins, function (i, el) {
            if ($.inArray(el, uniqueCoins) === -1) uniqueCoins.push(el);
          });
          filteredElements = (compareArrays = (uniqueCoins, upperCasedLink) => {
            upperCasedLink.forEach((coin) => {
              if (!uniqueCoins.includes(coin)) {
                filteredElements.push(coin);
              }
            });
            return filteredElements;
          })(uniqueCoins, upperCasedLink);
          if (filteredElements.length) {
            if (filteredElements.length == 1) {
              drawModalElements(
                checkedSliders,
                checkedSliders[5],
                ` ${filteredElements.join()} is not recognized in our servers, please try another coin.`
              );
            } else {
              drawModalElements(
                checkedSliders,
                checkedSliders[5],
                `Our servers cannot get the data of the following coins: ${filteredElements.join()}. Please uncheck them and try different coins.`
              );
            }
          } else {
            //If the user choose 1 coin that cannot be fetched or the user did not choose any coins at all,
            //Displaying the modal element with the following message.
            if (currencies.Response === "Error") {
              drawModalElements(
                checkedSliders,
                checkedSliders[5],
                "No coins were checked, please check some coins in order to procced to the live reports."
              );
              //If the user successfully choose coins that the API recognize, render the canvas with the given coins values.
            } else {
              /**
               * Calling the API in order to create a database of the coins that the API recognizes.
               */
              (createCanvasDB = () => {
                return $.get(
                  `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${uniqueCoins.join()}&tsyms=USD`,
                  (currencies) => {
                    for (let currency in currencies) {
                      if (currencies.hasOwnProperty(currency)) {
                        options.data.push({
                          type: "spline",
                          name: currency,
                          showInLegend: true,
                          xValueFormatString: "hh:mm:s",
                          yValueFormatString: "",
                          dataPoints: [],
                        });
                      }
                    }
                  }
                );
              })();
              /**
               * Calling the API for the second time, this time with an loop that will run every 2 seconds and call the api with new data and update the canvas animation.
               *
               * Assigning the SetInterval into the global variable in order to clear the interval in functions that outside of the current scope.
               */
              let updateEveryTwoSeconds = setInterval(() => {
                $.get(
                  `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${uniqueCoins.join()}&tsyms=USD`,
                  (currencies) => {
                    for (const symbol in currencies) {
                      if (currencies.hasOwnProperty(symbol)) {
                        const usd = currencies[symbol];
                        for (let i = 0; i < options.data.length; i++) {
                          if (symbol == options.data[i].name) {
                            options.data[i].dataPoints.push({
                              x: new Date(),
                              y: usd.USD,
                            });
                          }
                        }
                      }
                    }
                    $("#chartContainer").show();
                    $("#chartContainer").CanvasJSChart().render();
                  }
                ).fail(() => {
                  $("#error").css("display", "block");
                  $(".container").empty();
                });
              }, 2000);
              $("#modal").modal("hide");
              $(".personal-info").css("display", "none");
              $(".cards-container").css("display", "none");

              $(".home").on("click", () => {
                clearInterval(updateEveryTwoSeconds);
              });
              $(".about-btn").on("click", () => {
                clearInterval(updateEveryTwoSeconds);
              });
            }
          }
        }
      ).fail(() => {
        $("#error").css("display", "block");
        $(".container").empty();
      });
    }

    //Canvas start
    let options = {
      animationEnabled: true,
      data: [],
      title: {
        text: `${canvasLink.join(",").toUpperCase()} to USD`,
      },
      axisY: {
        title: "Value In USD ($)",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      axisX: {
        title: "Time Lapse",
        titleFontColor: "#C0504E",
        lineColor: "#C0504E",
        labelFontColor: "#C0504E",
        tickColor: "#C0504E",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
      },
    };

    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }
    $("#chartContainer").CanvasJSChart(options);
    //Canvas end
  });
};

/**
 *
 * Function that Synchronizes the checkboxes that share the same id on the modal and on the cards, and checks or unchecks them on click.
 */

let modalSlidersHandler = (e) => {
  let cardLabelCheckbox;
  let modalLabelId = $(e.target).parent().attr("id");
  let modalLabelSymbol = $(e.target).parent().siblings().eq(0).attr("id");
  let modalLabel = $(e.target).parent();
  let modalLabelName = $(e.target).parent().siblings().html();
  let cardLabelArray = $(".switch");
  for (let i = 0; i < cardLabelArray.length; i++) {
    if (modalLabelId == cardLabelArray[i].id) {
      cardLabelCheckbox = $(".switch").eq(i).children().eq(0);
      cardLabelCheckbox.prop("checked", !cardLabelCheckbox.prop("checked"));
      modalLabelCheckbox = $(".switch-modal").eq(i).children().eq(0);
      if (cardLabelCheckbox.prop("checked")) {
        cardLabelCheckbox.prop("checked", true);
        modalLabel.prop("checked", true);
        checkedSliders.push({
          name: modalLabelName,
          id: modalLabelId,
          symbol: modalLabelSymbol,
        });
      } else {
        cardLabelCheckbox.prop("checked", false);
        modalLabel.prop("checked", false);
        checkedSliders.forEach((object) => {
          if (object.id == modalLabelId) {
            spliceArray(checkedSliders, object);
          }
        });
      }
    }
  }
};

/**
 *
 * @param {Array} splicedArray - Iterates over the given array and splicing the matched element
 * @param {String} splicedElement - The element we want to be removed
 */

let spliceArray = (splicedArray, splicedElement) => {
  let index = splicedArray.indexOf(splicedElement);
  if (index > -1) {
    splicedArray.splice(index, 1);
  }
  return splicedArray;
};
