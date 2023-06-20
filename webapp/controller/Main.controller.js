sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/TextArea"
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    Fragment,
    mobileLibrary,
    Dialog,
    Button,
    Text,
    TextArea
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
                  oViewModel.setProperty("/valueStateChargT", "Parti Gir");
                  oViewModel.setProperty("/Charg", "");
                  oViewModel.setProperty("/EvClabs", "");
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idXchpf").focus();
                  });
                } else {
                  oViewModel.setProperty("/ChargEnabled", false);
                  oViewModel.setProperty("/Charg", "");
                  oViewModel.setProperty("/valueStateCharg", "None");
                  oViewModel.setProperty("/valueStateChargT", "");
                  this.onPressCheckItem();
                  jQuery.sap.delayedCall(200, this, function () {
                    this.getView().byId("idQuan").focus();
                  });
                }
              }
            }
          },
          fnError = (err) => { },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getBarcodeDetail(oBarcode, oWerks)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      onChangeCharg: function (oEvent) {
        let oViewModel = this.getView().getModel("viewModel"),
          oLgnumType = oViewModel.getProperty("/EvDepoTipi");
        oViewModel.setProperty("/valueStateLgpla", "None");
        oViewModel.setProperty("/valueStateChargT", "");
        if (oLgnumType === "EWM") {
          jQuery.sap.delayedCall(200, this, function () {
            this.getView().byId("idType").focus();
          });
        } else {
          jQuery.sap.delayedCall(200, this, function () {
            this.getView().byId("idQuan").focus();
          });
        }
        this.onPressCheckItem();
        oViewModel.refresh(true);
      },
      onAddressCheck: async function (oEvent) {
        let oLgnum = this.getModel("viewModel").getProperty("/EvLgnum"),
          oLgpla = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel"),
          oInput = this.byId("idType"),
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
          fnError = (err) => { },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._detailStock(oLgnum, String(oLgpla))
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      onPressCheckItem: async function () {
        let oViewModel = this.getModel("viewModel"),
          oClabs = this.getModel("viewModel").getProperty("/Quantity"),
          oCharg = this.getModel("viewModel").getProperty("/Charg"),
          oLgort = this.getModel("viewModel").getProperty("/GenericKlgort"),
          //oLgort = "1000",
          oMatnr = this.getModel("viewModel").getProperty("/BarcodeForm/Matnr"),
          oWerks = this.getModel("viewModel").getProperty("/Form/Werks");
        if (oCharg && oLgort && oMatnr && oWerks) {
          let fnSuccess = (oData) => {
            if (oData.Type === "E") {
              oViewModel.setProperty("/Quantity", "");
              return sap.m.MessageBox.error(oData.Message);
            } else {
              let iClabs = this._formatQuantity(oData.EvClabs);
              oViewModel.setProperty("/EvClabs", iClabs);
              //   this._onPressAddItem();

              //   this._onPressAddItem(oClabs, oCharg, oLgort, oMatnr, oWerks);
            }
          },
            fnError = (err) => { },
            fnFinally = () => {
              oViewModel.setProperty("/busy", false);
            };
          await this._addressStock(oClabs, oCharg, oLgort, oMatnr, oWerks)
            .then(fnSuccess)
            .catch(fnError)
            .finally(fnFinally);
        }
      },
      onPressCheckItemQuan: async function () {
        let oViewModel = this.getModel("viewModel"),
          oClabs = this.getModel("viewModel").getProperty("/Quantity"),
          oCharg = this.getModel("viewModel").getProperty("/Charg"),
          oLgort = this.getModel("viewModel").getProperty("/GenericKlgort"),
          //oLgort = "1000",
          oMatnr = this.getModel("viewModel").getProperty("/BarcodeForm/Matnr"),
          oWerks = this.getModel("viewModel").getProperty("/Form/Werks");
        if (oClabs && oCharg && oLgort && oMatnr && oWerks) {
          let fnSuccess = (oData) => {
            if (oData.Type === "E") {
              oViewModel.setProperty("/Quantity", "");
              return sap.m.MessageBox.error(oData.Message);
            } else {
              //  let iClabs = this._formatQuantity(oData.EvClabs);
              // oViewModel.setProperty("/EvClabs", iClabs);
              this._onPressAddItem();

              //   this._onPressAddItem(oClabs, oCharg, oLgort, oMatnr, oWerks);
            }
          },
            fnError = (err) => { },
            fnFinally = () => {
              oViewModel.setProperty("/busy", false);
            };
          await this._addressStock(oClabs, oCharg, oLgort, oMatnr, oWerks)
            .then(fnSuccess)
            .catch(fnError)
            .finally(fnFinally);
        }
      },
      onPressItem: async function () {
        let oViewModel = this.getModel("viewModel");
        oViewModel.setProperty("/DeleteEnabled", true);
        oViewModel.refresh(true);
      },
      onPressDeleteItem: async function (oEvent) {
        let oModel = this.getModel(),
          oTable = this.getView().byId("idTable"),
          oViewModel = this.getModel("viewModel");

        let DialogType = mobileLibrary.DialogType,
          ButtonType = mobileLibrary.ButtonType;

        if (!this.oApproveDialog) {
          this.oApproveDialog = new Dialog({
            type: DialogType.Message,
            title: "Mesaj Kutusu",
            content: new Text({
              text: "Satır silinsin mi ?"
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Sil",
              press: function () {
                let sPath = this.getView()
                  .byId("idTable")
                  .getSelectedItem()
                  .getBindingContext().sPath;
                oModel.remove(sPath);
                oTable.removeSelections();
                oViewModel.setProperty("/DeleteEnabled", true);
                oModel.refresh(true);
                this.oApproveDialog.close();
              }.bind(this),
            }),
            endButton: new Button({
              text: "Geri",
              press: function () {
                this.oApproveDialog.close();
              }.bind(this),
            }),
          });
        }

        this.oApproveDialog.open();
      },
      onClear: async function () {
        let oViewModel = this.getModel("viewModel");
        sap.ui.getCore().getMessageManager().removeAllMessages();
        let oMessageModel = this.getModel("message");
        let oStockAddressTmp = oViewModel.getProperty("/StockAddressTmp");
        let oStockAddress = oViewModel.getProperty("/StockAddress");

        oViewModel.setProperty("/Hlgort", "");
        oViewModel.setProperty("/Klgort", "");
        oViewModel.setProperty("/Barcode", "");
        oViewModel.setProperty("/BarcodeForm", "");
        oViewModel.setProperty("/Charg", "");
        oViewModel.setProperty("/Quantity", "");
        oViewModel.setProperty("/EvQuan", "");
        oViewModel.setProperty("/EvUnit", "");
        if (oStockAddress !== oStockAddressTmp) {
          oViewModel.setProperty("/StockAddress", "");
        }
        this.byId("_IDGenText4").setText("");
        oMessageModel.setProperty("/", []);
        jQuery.sap.delayedCall(200, this, function () {
          this.getView().byId("idBarcode").focus();
        });
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
      onValueHelpLgort: function (oEvent) {
        let sInputValue = oEvent.getSource().getValue(),
          oViewModel = this.getModel("viewModel");
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpLgort) {
          this._valueHelpLgort = sap.ui.xmlfragment(
            "com.kormas.productiontrns.fragment.valueHelp.Lgpla",
            this
          );
          this.getView().addDependent(this._valueHelpLgort);
        }

        //-------------------------------------------------------------//
        // open value help dialog filtered by the input value
        this._valueHelpLgort.open(sInputValue);
      },

      onSearchLgort: function (oEvent) {
        let sValue = oEvent.getParameter("value"),
          oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "Lgpla",
                sap.ui.model.FilterOperator.Contains,
                sValue
              )

            ],
            and: false,
          });

        oEvent.getSource().getBinding("items").filter(oFilter);
      },

      onCloseLgort: function (oEvent) {
        let oSelectedItem = oEvent.getParameter("selectedItem"),
          oViewModel = this.getModel("viewModel");
        if (oSelectedItem) {
          let oInput = this.byId(this.inputId);
          oInput.setValue(oSelectedItem.getTitle());

          oViewModel.setProperty("/StockAddress", oSelectedItem.getTitle());
          jQuery.sap.delayedCall(200, this, function () {
            this.getView().byId("idQuan").focus();
          });
        }
        oEvent.getSource().getBinding("items").filter([]);
      },
      onSuggest: function (oEvent) {
        var sTerm = oEvent.getParameter("suggestValue");
        var aFilters = [];
        if (sTerm) {
          aFilters.push(new Filter("Lgpla", FilterOperator.StartsWith, sTerm));
        }

        oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
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
      onBack: function () {
        history.go(-1);
      },

      onPressRemoveSelections: function () {

        this.getView().byId("idTable").removeSelections();

      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _onObjectMatched: async function () {
        let oViewModel = this.getModel("viewModel"),
          that = this;

        this.onClear();

        this.getModel("commonService").callFunction("/GetLgnum", {
          method: "GET",
          success: function (oData, response) {
            if (oData.Type === "E") {
              sap.m.MessageBox.error(oData.Message);
            } else {
              oViewModel.setProperty("/Form", oData);

              that._getLgortValueHelp(oData.Werks);
              that._getLgplaSH();
              that._onGetSuggestShelf();
            }
          },
          error: function (oError) { },
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
          fnError = (err) => { },
          fnFinally = () => {
            oViewModel.setProperty("/busy", false);
          };
        await this._getLgpla(String(oLgpla))
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
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
        //  uName = "BTC-FIORI",
          oParams = {},
          oEntry = {
            Matnr: oMatnr,
            Charg: oCharg,
            Quan: oClabs,
            Lgnum: oLgnum,
            Werks: oWerks,
            Lgpla: oStockAddress === undefined ? (oStockAddress = "") : oStockAddress,
            Unit: oViewModel.getProperty("/BarcodeForm/Meins"),
            Klgort: oViewModel.getProperty("/GenericKlgort"),
            //	Klgort: "1000",
            Hlgort: oViewModel.getProperty("/GenericHlgort"),
            //	Hlgort: "1002",
              Uname: sap.ushell.Container.getService("UserInfo").getId(),
          //  Uname: uName,
          };
        if (oViewModel.getProperty("/EvDepoTipi") === "EWM") {
          if (oEntry.Lgpla === "") {
            sap.m.MessageBox.error(this.getResourceBundle().getText("errorAddress"));
            return;
          }
        }

        if (!oStockAddress) {
          delete oEntry.Lglpa;
        }
        if (oClabs === "" || oClabs === undefined) {
          sap.m.MessageBox.error(this.getResourceBundle().getText("errorQuantity"));
          return;
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
            error: function (oError) { },
          });
      },
      _getLgplaSH: function () {
        let oViewModel = this.getModel("viewModel");

        this.getView()
          .getModel("commonService")
          .read("/LgplaSHSet", {
            success: function (oData) {
              oViewModel.setProperty("/LgortResults", oData.results);

            },
            error: function (oError) { },
          });
      },
      _getSuggestShelf: function (oLgort, oUname) {

        let oModel = this.getModel();

        return new Promise((fnResolve, fnReject) => {
          let oParams = {
            success: fnResolve,
            error: fnReject,
          },
            sPath = oModel.createKey("/SuggestShelfSet", {
              IvLgort: oLgort,
              IvUname: oUname,
            });
          oModel.read(sPath, oParams);
        });

      },

      _onGetSuggestShelf: async function () {
        let oLgort = this.getModel("viewModel").getProperty("/GenericHlgort"),
            oUname = sap.ushell.Container.getService("UserInfo").getId();
         // oUname = "BTC-FIORI";
        let fnSuccess = (oData) => {
          if (oData) {
            this._setLgortValue(oData.EvLgpla)
          }
        },
          fnError = (err) => {
          },
          fnFinally = () => {
            jQuery.sap.delayedCall(500, this, function () {
              this.getView().byId("idBarcode").focus();
            });
            // oViewModel.setProperty("/busy", false);
          };
        await this._getSuggestShelf(oLgort, oUname)
          .then(fnSuccess)
          .catch(fnError)
          .finally(fnFinally);
      },
      _setLgortValue: function (oLgpla) {

        let oViewModel = this.getModel("viewModel");

        if (oLgpla) {
          let oInput = this.byId("idType");
          oInput.setValue(oLgpla);

          oViewModel.setProperty("/StockAddress", oLgpla);
          oViewModel.setProperty("/StockAddressTmp", oLgpla);
          jQuery.sap.delayedCall(200, this, function () {
            this.getView().byId("idQuan").focus();

          });
        }
        oEvent.getSource().getBinding("items").filter([]);

      }
    });
  }
);