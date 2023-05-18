sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    Fragment
  ) {
    "use strict";

    return BaseController.extend("com.kormas.productiontrns.controller.First", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        this.getRouter()
          .getRoute("First")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      onStockQuery: async function () {
        let oCrossAppNavigator = sap.ushell.Container.getService(
          "CrossApplicationNavigation"
        ), // get a handle on the global XAppNav service
          hash =
            (oCrossAppNavigator &&
              oCrossAppNavigator.hrefForExternal({
                target: {
                  semanticObject: "materialQuery",
                  action: "display",
                },
              })) ||
            ""; // generate the Hash to display a Supplier
        oCrossAppNavigator.toExternal({
          target: {
            shellHash: hash,
          },
        }); // navigate to Supplier application
      },
      onValueHelpKlgort: function (oEvent) {
        let sInputValue = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel");
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpKlgort) {
          this._valueHelpKlgort = sap.ui.xmlfragment(
            "com.kormas.productiontrns.fragment.valueHelp.WareHouseKlgort",
            this
          );
          this.getView().addDependent(this._valueHelpKlgort);
        }

        //-------------------------------------------------------------//
        // open value help dialog filtered by the input value
        this._valueHelpKlgort.open(sInputValue);
      },
      onValueHelpHlgort: function (oEvent) {
        let sInputValue = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel");
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpHlgort) {
          this._valueHelpHlgort = sap.ui.xmlfragment(
            "com.kormas.productiontrns.fragment.valueHelp.WareHouseHlgort",
            this
          );
          this.getView().addDependent(this._valueHelpHlgort);
        }

        //-------------------------------------------------------------//
        // open value help dialog filtered by the input value
        this._valueHelpHlgort.open(sInputValue);
      },
      onSearchKlgort: function (oEvent) {
        let sValue = oEvent.getParameter("value"),
          oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "Werks",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "Lgort",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "Lgobe",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
            ],
            and: false,
          });

        oEvent.getSource().getBinding("items").filter(oFilter);
      },
      onSearchHlgort: function (oEvent) {
        let sValue = oEvent.getParameter("value"),
          oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "Werks",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "Lgort",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "Lgobe",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
            ],
            and: false,
          });
        oEvent.getSource().getBinding("items").filter(oFilter);
      },

      onCloseKlgort: function (oEvent) {
        let oSelectedItem = oEvent.getParameter("selectedItem"),
          oViewModel = this.getModel("viewModel");
        if (oSelectedItem) {
          let oInput = this.byId(this.inputId);

          if (oSelectedItem.getTitle() === "1000") {
            sap.m.MessageBox.error(
              this.getResourceBundle().getText("errorKlgort")
            );
            oViewModel.setProperty("/Klgort", "");
          } else {
            oInput.setValue(oSelectedItem.getTitle());
            oInput.setDescription(oSelectedItem.getDescription());
            oViewModel.setProperty("/GenericKlgort", oSelectedItem.getTitle());
            oViewModel.setProperty(
              "/GenericKlgortT",
              oSelectedItem.getDescription()
            );
            oViewModel.setProperty("/Klgort", oSelectedItem.getTitle());
          }
        }
        oEvent.getSource().getBinding("items").filter([]);
      },
      onChangeKlgort: function (oEvent) {
        let oKlgort = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel"),
          oHlgort = oViewModel.getProperty("/GenericHlgort"),
          oInput = this.byId("_IDGenInput1"),
          aKlgortResults = oViewModel.getProperty("/KlgortResults");

        if (oKlgort === "1000") {
          sap.m.MessageBox.error(
            this.getResourceBundle().getText("errorKlgort")
          );
          oInput.setDescription("");
          oViewModel.setProperty("/Klgort", "");
          oViewModel.setProperty("/GenericKlgort", "");
          oViewModel.setProperty("/GenericKlgortT", "");
          return;
        } else {
          const oResults = aKlgortResults.filter(
            (Klgort) => Klgort.Lgort === oKlgort
          );
          if (oResults.length > 0) {
            oViewModel.setProperty("/GenericKlgort", oResults[0].Lgort);
            oViewModel.setProperty("/GenericKlgortT", oResults[0].Lgobe);
            oInput.setDescription(oResults[0].Lgobe);
            jQuery.sap.delayedCall(200, this, function () {
              this.getView().byId("_IDGenInput2").focus();
            });
          } else {
            oViewModel.setProperty("/Klgort", "");
            oViewModel.setProperty("/GenericKlgort", "");
            oViewModel.setProperty("/GenericKlgortT", "");
            oInput.setDescription("");
            sap.m.MessageBox.error(
              this.getResourceBundle().getText("errorLgort")
            );
          }
        }
      },
      onChangeHlgort: function (oEvent) {
        let oViewModel = this.getModel("viewModel"),
          oInput = this.byId("_IDGenInput2"),
          aHlgortResults = oViewModel.getProperty("/HlgortResults"),
          oHlgort = oEvent.getSource().getValue(),
          oKlgort = oViewModel.getProperty("/GenericKlgort");
        const oResults = aHlgortResults.filter(
          (Hlgort) => Hlgort.Lgort === oHlgort
        );
        if (oResults.length > 0) {
          oViewModel.setProperty("/GenericHlgort", oResults[0].Lgort);
          oViewModel.setProperty("/GenericHlgortT", oResults[0].Lgobe);
          oInput.setDescription(oResults[0].Lgobe);
          if (oKlgort) {
            this._getLgnumType(oHlgort);
            //  oViewModel.setProperty("/visibleBackButton", true);
            // oViewModel.setProperty("/visibleHeader", false);
          }
        } else {
          oViewModel.setProperty("/Hlgort", "");
          oViewModel.setProperty("/GenericHlgort", "");
          oViewModel.setProperty("/GenericHlgortT", "");
          oInput.setDescription("");
          sap.m.MessageBox.error(
            this.getResourceBundle().getText("errorLgort")
          );
        }
      },
      onCloseHlgort: function (oEvent) {
        let oSelectedItem = oEvent.getParameter("selectedItem"),
          oViewModel = this.getModel("viewModel");
        if (oSelectedItem) {
          let oInput = this.byId(this.inputId);
          oInput.setValue(oSelectedItem.getTitle());
          oInput.setDescription(oSelectedItem.getDescription());
          oViewModel.setProperty("/GenericHlgort", oSelectedItem.getTitle());
          oViewModel.setProperty(
            "/GenericHlgortT",
            oSelectedItem.getDescription()
          );
          oViewModel.setProperty("/Hlgort", oSelectedItem.getTitle());
          if (oViewModel.getProperty("/GenericKlgort")) {
            //  this.getView().byId("_IDGenObjectPageLayout1").setHeaderExpanded(false);
            //    oViewModel.setProperty("/visibleHeader", false);
            //   oViewModel.setProperty("/visibleBackButton", true);
          }

          this._getLgnumType(oSelectedItem.getTitle());
        }
        oEvent.getSource().getBinding("items").filter([]);
      },
      onNext: function () {
        this.getRouter().navTo("main", {});
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _onObjectMatched: async function () {
        let oViewModel = this.getModel("viewModel"),
          that = this;
        this._clearData();



        this.getModel("commonService").callFunction("/GetLgnum", {
          method: "GET",
          success: function (oData, response) {
            if (oData.Type === "E") {
              sap.m.MessageBox.error(oData.Message);
            } else {
              oViewModel.setProperty("/Form", oData);

              that._getLgortValueHelp(oData.Werks);
            }
          },
          error: function (oError) { },
        });
      },
      _clearData: async function () {
        let oViewModel = this.getModel("viewModel");
        oViewModel.setProperty("/Klgort", "");
        oViewModel.setProperty("/Hlgort", "");
        oViewModel.setProperty("/valueStateKlgort", "None");
        oViewModel.setProperty("/valueStateKlgortT", "");
        oViewModel.setProperty("/valueStateHlgort", "None");
        oViewModel.setProperty("/valueStateHlgortT", "");
        oViewModel.setProperty("/GenericKlgort", "");
        oViewModel.setProperty("/GenericKlgortT", "");
        oViewModel.setProperty("/GenericHlgort", "");
        oViewModel.setProperty("/GenericHlgortT", "");
        let oKInput = this.byId("_IDGenInput1");
        oKInput.setDescription("");
        let oHInput = this.byId("_IDGenInput2");
        oHInput.setDescription("");
      },
      _getLgnumType: async function (oLgort) {
        let oViewModel = this.getModel("viewModel"),
          oWerks = oViewModel.getProperty("/Form/Werks"),
          fnSuccess = (oData) => {
            oViewModel.setProperty("/EvDepoTipi", oData.EvDepoTipi);
            oViewModel.setProperty("/EvLgnum", oData.EvLgnum);
            // oViewModel.setProperty("/EvDepoTipi", "EWM");
          },
          fnError = (err) => { },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getLgnumTypeDetail(oLgort, oWerks)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      _getLgnumTypeDetail: async function (oLgort, oWerks) {
        let oModel = this.getModel("commonService");

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
            success: fnResolve,
            error: fnReject,
          },
            sPath = oModel.createKey("/LgnumTypeSet", {
              IvLgort: oLgort,
              IvWerks: oWerks,
            });
          oModel.read(sPath, oParams);
        });
      },

      _getLgortValueHelp: function (oWerks) {
        let oViewModel = this.getModel("viewModel"),
          oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "Werks",
                sap.ui.model.FilterOperator.EQ,
                oWerks
              ),
            ],
          });
        this.getView()
          .getModel("commonService")
          .read("/WareHouseSet", {
            filters: oFilter.aFilters,
            success: function (oData) {
              oViewModel.setProperty("/HlgortResults", oData.results);
              oViewModel.setProperty("/KlgortResults", oData.results);
            },
            error: function (oError) { },
          });
      },
    });
  }
);
