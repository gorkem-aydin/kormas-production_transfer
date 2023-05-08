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

    return BaseController.extend("com.kormas.productiontrns.controller.Main", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        //test
        
        
        this.getRouter()
          .getRoute("main")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      onChangeBarcode: async function () {
        let oBarcode = this.getModel("viewModel").getProperty("/Barcode"),
          oWerks = this.getModel("viewModel").getProperty("/Form/Werks"),
          oViewModel = this.getModel("viewModel"),
          oType = oViewModel.getProperty("/EvDepoTipi"),
          fnSuccess = (oData) => {
            oViewModel.setProperty("/BarcodeForm", oData);
            if (oData.Type === "E") {
              sap.m.MessageBox.error(oData.Message);
              oViewModel.setProperty("/Charg", "");
            } else {
              if (oBarcode.length === 10) {
                if (oType === "EWM") {
                  oViewModel.setProperty("/Charg", oData.IvBarcode);
                  oViewModel.setProperty("/ChargEnabled", false);
                  this.onPressCheckItem();
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idType").focus();
                  });
                } else {
                  oViewModel.setProperty("/Charg", oData.IvBarcode);
                  oViewModel.setProperty("/ChargEnabled", false);
                  this.onPressCheckItem();
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idQuan").focus();
                  });
                }
              } else {
                if (oData.Type === "W") {
                  oViewModel.setProperty("/ChargEnabled", true);
                  oViewModel.setProperty("/valueStateCharg", "Warning");
                  oViewModel.setProperty("/valueStateChargT", oData.Message);
                  oViewModel.setProperty("/Charg", "");
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idXchpf").focus();
                  });
                } else {
                  oViewModel.setProperty("/ChargEnabled", false);
                  oViewModel.setProperty("/Charg", "");
                  oViewModel.setProperty("/valueStateCharg", "None");
                  this.onPressCheckItem();
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idQuan").focus();
                  });
                }
              }
            }
          },
          fnError = (err) => {},
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getBarcodeDetail(oBarcode, oWerks)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      onChangeCharg: function (oEvent) {
        jQuery.sap.delayedCall(200, this, function () {
          this.getView().byId("idQuan").focus();
        });
      },
      onAddressCheck: async function (oEvent) {
        let oLgnum = this.getModel("viewModel").getProperty("/EvLgnum"),
          oLgpla = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel"),
          fnSuccess = (oData) => {
            if (oData.Type === "E") {
              oViewModel.setProperty("/valueStateLgpla", "Error");
              oViewModel.setProperty("/valueStateLgplaText", oData.Message);
            } else {
              oViewModel.setProperty("/valueStateLgpla", "Success");
              jQuery.sap.delayedCall(200, this, function () {
                this.getView().byId("idQuan").focus();
              });

              //	this._onLgnumAuth(String(oLgpla), iControl);
            }
          },
          fnError = (err) => {},
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._detailStock(oLgnum, String(oLgpla))
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      onPressCheckItem: async function (oEvent) {
        let oViewModel = this.getModel("viewModel"),
          oClabs = this.getModel("viewModel").getProperty("/Quantity"),
          oCharg = this.getModel("viewModel").getProperty("/Charg"),
          oLgort = this.getModel("viewModel").getProperty("/Klgort"),
          //oLgort = "1000",
          oMatnr = this.getModel("viewModel").getProperty("/BarcodeForm/Matnr"),
          oWerks = this.getModel("viewModel").getProperty("/Form/Werks"),
          fnSuccess = (oData) => {
            if (oData.Type === "E") {
              oViewModel.setProperty("/Quantity", "");
              return sap.m.MessageBox.error(oData.Message);
            } else {
              let iClabs = this._formatQuantity(oData.EvClabs);
              oViewModel.setProperty("/EvClabs", iClabs);

              //   this._onPressAddItem(oClabs, oCharg, oLgort, oMatnr, oWerks);
            }
          },
          fnError = (err) => {},
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._addressStock(oClabs, oCharg, oLgort, oMatnr, oWerks)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      onPressItem: async function () {
        let oViewModel = this.getModel("viewModel");
        oViewModel.setProperty("/DeleteEnabled", true);
        oViewModel.refresh(true);
      },
      onPressDeleteItem: async function (oEvent) {
        let oModel = this.getModel(),
          oTable = this.getView().byId("idTable"),
          oViewModel = this.getModel("viewModel"),
          sPath = this.getView()
            .byId("idTable")
            .getSelectedItem()
            .getBindingContext().sPath;

        oModel.remove(sPath);
        oTable.removeSelections();
        oViewModel.setProperty("/DeleteEnabled", true);
      },
      onClear: async function () {
        let oViewModel = this.getModel("viewModel");
        sap.ui.getCore().getMessageManager().removeAllMessages();

        let oMessageModel = this.getModel("message");

        //oViewModel.setProperty("/Hlgort", "");
        // oViewModel.setProperty("/Klgort", "");
        oViewModel.setProperty("/Barcode", "");
        oViewModel.setProperty("/BarcodeForm", "");
        oViewModel.setProperty("/Charg", "");
        oViewModel.setProperty("/Quantity", "");
        oViewModel.setProperty("/EvQuan", "");
        oViewModel.setProperty("/EvUnit", "");
        oViewModel.setProperty("/StockAddress", "");
        this.byId("_IDGenText4").setText("");

        oMessageModel.setProperty("/", []);
      },
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

            if (oViewModel.getProperty("/GenericHlgort")) {
              //  this.getView().byId("_IDGenObjectPageLayout1").getShowAnchorBar(true);
              //  this.getView().byId("_IDGenObjectPageLayout1").setToggleHeaderOnTitleClick(true);
              oViewModel.setProperty("/visibleGenericTagK", true);
              oViewModel.setProperty("/visibleHeader", false);
              oViewModel.setProperty("/visibleBackButton", true);
            }
            jQuery.sap.delayedCall(200, this, function () {
              this.getView().byId("_IDGenInput2").focus();
            });
            //     this._getLgnumType(oSelectedItem.getTitle());
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
        oInput.setDescription("");
        if (oKlgort === "1000") {
          sap.m.MessageBox.error(
            this.getResourceBundle().getText("errorKlgort")
          );
          oViewModel.setProperty("/Klgort", "");
          oViewModel.setProperty("/GenericKlgort", "");
          oViewModel.setProperty("/GenericKlgortT", "");
          return;
        } else {
          const oResults = aKlgortResults.filter(
            (Klgort) => Klgort.Lgort === oKlgort
          );
          if (oResults.length > 0) {
            if (!oHlgort) {
              jQuery.sap.delayedCall(200, this, function () {
                this.getView().byId("_IDGenInput2").focus();
              });
              //  this._getLgnumType(oKlgort);
              oViewModel.setProperty("/visibleBackButton", false);
              oViewModel.setProperty("/visibleHeader", true);
            } 
            else{
              oViewModel.setProperty("/visibleBackButton", true);
              oViewModel.setProperty("/visibleHeader", false); 
            }

            oViewModel.setProperty("/visibleGenericTagK", true);
            oViewModel.setProperty("/GenericKlgort", oResults[0].Lgort);
            oViewModel.setProperty("/GenericKlgortT", oResults[0].Lgobe);
          } else {
            oViewModel.setProperty("/visibleGenericTagK", false);
            oViewModel.setProperty("/Klgort", "");
            oViewModel.setProperty("/GenericKlgort", "");
            oViewModel.setProperty("/GenericKlgortT", "");
            sap.m.MessageBox.error(
              this.getResourceBundle().getText("errorLgort")
            );
          }
        }
      },
      onChangeHlgort: function (oEvent) {
        let oViewModel = this.getModel("viewModel"),
          aHlgortResults = oViewModel.getProperty("/HlgortResults"),
          oHlgort = oEvent.getSource().getValue(),
          oKlgort = oViewModel.getProperty("/GenericKlgort");
        const oResults = aHlgortResults.filter(
          (Hlgort) => Hlgort.Lgort === oHlgort
        );
        if (oResults.length > 0) {
          oViewModel.setProperty("/visibleGenericTagH", true);
          oViewModel.setProperty("/GenericHlgort", oResults[0].Lgort);
          oViewModel.setProperty("/GenericHlgortT", oResults[0].Lgobe);

          if (oKlgort) {
            jQuery.sap.delayedCall(200, this, function () {
              this.getView().byId("idBarcode").focus();
            });
                this._getLgnumType(oHlgort);
            oViewModel.setProperty("/visibleBackButton", true);
            oViewModel.setProperty("/visibleHeader", false);
          }
        } else {
          oViewModel.setProperty("/visibleGenericTagH", false);
          oViewModel.setProperty("/Hlgort", "");
          oViewModel.setProperty("/GenericHlgort", "");
          oViewModel.setProperty("/GenericHlgortT", "");
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
            oViewModel.setProperty("/visibleHeader", false);
            oViewModel.setProperty("/visibleGenericTagH", true);
            oViewModel.setProperty("/visibleBackButton", true);
          }
          jQuery.sap.delayedCall(200, this, function () {
            this.getView().byId("idBarcode").focus();
          });
             this._getLgnumType(oSelectedItem.getTitle());
        }
        oEvent.getSource().getBinding("items").filter([]);
      },
      onBackHeader: function () {
        let oViewModel = this.getModel("viewModel");
        oViewModel.setProperty("/visibleBackButton", false);
        this.getView()
          .byId("_IDGenObjectPageLayout1")
          .setShowHeaderContent(true);
        oViewModel.setProperty("/GenericHlgort", "");
        oViewModel.setProperty("/GenericHlgortT", "");
        oViewModel.setProperty("/GenericKlgort", "");
        oViewModel.setProperty("/GenericKlgortT", "");
        oViewModel.setProperty("/Klgort", "");
        oViewModel.setProperty("/Hlgort", "");
        this.getView().byId("_IDGenInput1").setDescription("");
        this.getView().byId("_IDGenInput2").setDescription("");
      },
      onMessagePopoverPress: async function (oEvent) {
        let oSourceControl = oEvent.getSource();
        this._getMessagePopover().then(function (oMessagePopover) {
          oMessagePopover.openBy(oSourceControl);
        });
      },
      onSave: async function (oEvent) {
        let oViewModel = this.getModel("viewModel"),
          fnSuccess = (oData) => {
            this.onClear();
            this.getModel().refresh(true);
            if (oData.Type === "E") {
              sap.m.MessageBox.error(oData.Message);
            } else {
              sap.m.MessageBox.success(oData.Message);
            }
            sap.ui.core.BusyIndicator.hide();
          },
          fnError = (err) => {
            sap.ui.core.BusyIndicator.hide();

            this._showMessage(err.responseText);
          },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        this._saveData().then(fnSuccess).catch(fnError).finally(fnFinally);
      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _onObjectMatched: async function () {
        let oViewModel = this.getModel("viewModel"),
          that = this;

        this.getModel("commonService").callFunction("/GetLgnum", {
          method: "GET",
          success: function (oData, response) {
            if (oData.Type === "E") {
              sap.m.MessageBox.error(oData.Message);
            } else {
              oViewModel.setProperty("/Form", oData);
             // that._getLgnumType(oData.Klgort);
              that._getLgortValueHelp(oData.Werks);
            }
          },
          error: function (oError) {},
        });
      },
      _getMessagePopover: function () {
        let oView = this.getView();

        // create popover lazily (singleton)
        if (!this._pMessagePopover) {
          this._pMessagePopover = Fragment.load({
            id: oView.getId(),
            name: "com.kormas.productiontrns.fragment.message.MessagePopover",
          }).then(function (oMessagePopover) {
            oView.addDependent(oMessagePopover);
            return oMessagePopover;
          });
        }
        return this._pMessagePopover;
      },
      _getLgnumType: async function (oLgort) {
        let oViewModel = this.getModel("viewModel"),
          oWerks = oViewModel.getProperty("/Form/Werks"),
          fnSuccess = (oData) => {
            oViewModel.setProperty("/EvDepoTipi", oData.EvDepoTipi);
            oViewModel.setProperty("/EvLgnum", oData.EvLgnum);

            //oViewModel.setProperty("/EvDepoTipi", "EWM");
            jQuery.sap.delayedCall(200, this, function () {
              this.getView().byId("_IDGenInput1").focus();
            });
          },
          fnError = (err) => {},
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getLgnumTypeDetail(oLgort, oWerks)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      _onLgnumAuth: async function (oLgpla, iControl) {
        let oViewModel = this.getModel("viewModel"),
          fnSuccess = (oData) => {
            if (iControl > 0) {
              if (oData.Type === "E") {
                oViewModel.setProperty("/valueStateKlgort", "Error");
                oViewModel.setProperty("/valueStateKlgortT", oData.Message);
              } else {
                oViewModel.setProperty("/valueStateKlgort", "Success");
                oViewModel.setProperty("/valueStateKlgortT", oData.Message);

                jQuery.sap.delayedCall(200, this, function () {
                  //		this.getView().byId("_IDGenInput2").focus();
                });
              }
            } else {
              if (oData.Type === "E") {
                oViewModel.setProperty("/valueStateHlgort", "Error");
                oViewModel.setProperty("/valueStateHlgortT", oData.Message);
              } else {
                oViewModel.setProperty("/valueStateHlgort", "Success");
                oViewModel.setProperty("/valueStateHlgortT", oData.Message);
              }
            }
          },
          fnError = (err) => {},
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getLgpla(String(oLgpla))
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
      _getBarcodeDetail: async function (oBarcode, oWerks) {
        let oModel = this.getModel("commonService");

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
              success: fnResolve,
              error: fnReject,
            },
            sPath = oModel.createKey("/BarcodeSet", {
              IvBarcode: oBarcode,
              IvWerks: oWerks,
            });
          oModel.read(sPath, oParams);
        });
      },
      _getLgpla: async function (oLgpla) {
        let oModel = this.getModel("commonService");

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
              success: fnResolve,
              error: fnReject,
            },
            sPath = oModel.createKey("/LgnumAuthCheckSet", {
              IvLgpla: oLgpla,
            });
          oModel.read(sPath, oParams);
        });
      },
      _detailStock: function (oLgnum, oLgpla) {
        let oModel = this.getModel("commonService");

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
              success: fnResolve,
              error: fnReject,
            },
            sPath = oModel.createKey("/AddressCheckSet", {
              IvLgnum: oLgnum,
              IvLgpla: oLgpla,
            });
          oModel.read(sPath, oParams);
        });
      },
      _addressStock: async function (oClabs, oCharg, oLgort, oMatnr, oWerks) {
        let oModel = this.getModel();

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
              success: fnResolve,
              error: fnReject,
            },
            sPath = oModel.createKey("/WarehouseStockCheckSet", {
              IvClabs: oClabs ? oClabs : "0",
              IvCharg: oCharg,
              IvLgort: oLgort,
              IvMatnr: oMatnr,
              IvWerks: oWerks,
            });
          oModel.read(sPath, oParams);
        });
      },
      _onPressAddItem: async function () {
        let oViewModel = this.getModel("viewModel"),
          oClabs = this.getModel("viewModel").getProperty("/Quantity"),
          oCharg = this.getModel("viewModel").getProperty("/Charg"),
          oLgnum = this.getModel("viewModel").getProperty("/EvLgnum"),
          //oLgort = "1000",
          oMatnr = this.getModel("viewModel").getProperty("/BarcodeForm/Matnr"),
          oWerks = this.getModel("viewModel").getProperty("/Form/Werks"),
          oStockAddress = oViewModel.getProperty("/StockAddress"),
          that = this,
          //	uName = "BTC-FIORI",
          oParams = {},
          oEntry = {
            Matnr: oMatnr,
            Charg: oCharg,
            Quan: oClabs,
            Lgnum: oLgnum,
            Werks: oWerks,
            Lgpla:
              oStockAddress === undefined
                ? (oStockAddress = "")
                : oStockAddress,
            Unit: oViewModel.getProperty("/BarcodeForm/Meins"),
            Klgort: oViewModel.getProperty("/Klgort"),
            //	Klgort: "1000",
            Hlgort: oViewModel.getProperty("/Hlgort"),
            //	Hlgort: "1002",
            Uname: sap.ushell.Container.getService("UserInfo").getId(),
            //Uname: uName,
          };
        if (!oStockAddress) {
          delete oEntry.Lglpa;
        }
        if (oClabs === "" || oClabs === undefined) {
          sap.m.MessageBox.error(this.getResourceBundle().getText("errorQuantity"));
          return ;
        }


        let fnSuccess = (oData) => {
            sap.ui.core.BusyIndicator.hide();
            this.onClear();
            this.getModel().refresh(true);
          },
          fnError = (err) => {
            sap.ui.core.BusyIndicator.hide();
          },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        this._addItemData(oEntry)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      _formatQuantity: function (oQuantitiy) {
        return parseFloat(oQuantitiy);
      },
      _addItemData: async function (oEntry) {
        let oModel = this.getModel();

        oEntry.to_ReturnItem = [];

        sap.ui.core.BusyIndicator.show(0);

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
            success: fnResolve,
            error: fnReject,
          };
          oModel.create("/RowHeaderSet", oEntry, oParams);
        });
      },

      _saveData: async function () {
        let oModel = this.getModel(),
          oDeepEntity = {};

        oDeepEntity.to_Return = [];

        sap.ui.core.BusyIndicator.show(0);

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
            success: fnResolve,
            error: fnReject,
          };
          oModel.create("/SaveHeaderSet", oDeepEntity, oParams);
        });
      },
      _showMessage: async function (oError) {
        let oTable = [],
          MessageModel = this.getModel("message"),
          oMessage = oError.split(">");
        if (oMessage.length > 2) {
          oTable.push({
            type: sap.ui.core.MessageType.Error,
            message: oMessage[5].split("<")[0],
          });
          MessageModel.setProperty("/", oTable);
        } else {
          oTable.push({
            type: sap.ui.core.MessageType.Error,
            message: oMessage[0],
          });
          MessageModel.setProperty("/", oTable);
        }
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
            error: function (oError) {},
          });
      },
    });
  }
);
