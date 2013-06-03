// ==UserScript==
// @name               DownloadPlus.uc.js
// @namespace          DownloadPlus@gmail.com
// @description        自用综合整理（Alice0775、紫云飞、ywzhaiqi）的Download脚本，右键点击下载按钮新建下载、
//                     下载重命名+另存为
//                     自动关闭下载产生的空白标签，完成下载提示音
// @include            main
// @include            chrome://browser/content/browser.xul
// @include            chrome://mozapps/content/downloads/unknownContentType.xul
// ==/UserScript==

//下载提示音
(function () {
    var downloadPlaySound = {
    DL_START : "",
    DL_DONE  : "file:///C:/WINDOWS/Media/chimes.wav",//设置响铃
    DL_CANCEL: "",
    DL_FAILED: "",

    observerService: null,
    init: function sampleDownload_init() {
        window.addEventListener("unload", this, false);
        this.observerService = Components.classes["@mozilla.org/observer-service;1"]
                                    .getService(Components.interfaces.nsIObserverService);
        this.observerService.addObserver(this, "dl-start", false);
        this.observerService.addObserver(this, "dl-done", false);
        this.observerService.addObserver(this, "dl-cancel", false);
        this.observerService.addObserver(this, "dl-failed", false);
    },

    uninit: function() {
        window.removeEventListener("unload", this, false);
        this.observerService.removeObserver(this, "dl-start");
        this.observerService.removeObserver(this, "dl-done");
        this.observerService.removeObserver(this, "dl-cancel");
        this.observerService.removeObserver(this, "dl-failed");
    },

    observe: function (subject, topic, state) {
        var oDownload = subject.QueryInterface(Components.interfaces.nsIDownload);
        var oFile = null;
        try{
            oFile = oDownload.targetFile;  
        } catch (e){
            oFile = oDownload.target;     
        }

        if (topic == "dl-start"){
        if (this.DL_START)
            this.playSoundFile(this.DL_START);
        }

        if(topic == "dl-cancel"){
            if (this.DL_CANCEL) this.playSoundFile(this.DL_CANCEL);
        }
        else if(topic == "dl-failed"){
            if (this.DL_FAILED) this.playSoundFile(this.DL_FAILED);
        }
        else if(topic == "dl-done"){
            if (this.DL_DONE) this.playSoundFile(this.DL_DONE);
        }
    },

    playSoundFile: function(aFilePath) {
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .createInstance(Components.interfaces["nsIIOService"]);
        try {
            var uri = ios.newURI(aFilePath, "UTF-8", null);
        } catch(e) {
            return;
        }
        var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
        if (!file.exists()) return;
        this.play(uri);
    },

    play: function(aUri) {
        var sound = Components.classes["@mozilla.org/sound;1"]
              .createInstance(Components.interfaces["nsISound"]);
        sound.play(aUri);
    },

    handleEvent: function(event) {
        switch (event.type) {
          case "load":
            this.init();
            break;
          case "unload":
            this.uninit();
            break;
        }
    }
}
downloadPlaySound.init();
})();
//新建下载
(function(){
    location == "chrome://browser/content/browser.xul" && (function () {
        var button = document.getElementById("downloads-button");
        button.addEventListener("click", onClicked, false);
        var observer = new window.MutationObserver(function(mutations){
            var newButton = document.getElementById("downloads-indicator");
            if(!newButton) return;
            newButton.addEventListener("click", onClicked, false);
            observer.disconnect();
        });
        observer.observe(button, { attributes: true });

        function onClicked(e){
            if(e.button == 2  && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey){
                e.preventDefault();
                e.stopPropagation();
                openNewDownloadDialog();
            }
        }
    })();

    function openNewDownloadDialog(){
        window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KICAgIDxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KICAgICAgICA8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KICAgICAgICA8dGV4dGJveCBmbGV4PSIxIi8+CiAgICA8L2hib3g+CiAgICA8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+CiAgICA8aGJveCBkaXI9InJldmVyc2UiPgogICAgICAgIDxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgogICAgPC9oYm94PgogICAgPHNjcmlwdD4KICAgICAgICA8IVtDREFUQVsKICAgICAgICBmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CiAgICAgICAgICAgIHZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKICAgICAgICAgICAgaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CiAgICAgICAgICAgICAgICBmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CiAgICAgICAgICAgICAgICAgICAgdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikuYWRkRXZlbnRMaXN0ZW5lcigia2V5dXAiLCBQYXJzZVVSTHMsIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJidXR0b24iKS5hZGRFdmVudExpc3RlbmVyKCJjb21tYW5kIiwgZnVuY3Rpb24gKCkgewogICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewogICAgICAgICAgICAgICAgb3BlbmVyLnNhdmVVUkwodXJsICwgbnVsbCwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgZG9jdW1lbnQpOwogICAgICAgICAgICB9KTsKICAgICAgICAgICAgY2xvc2UoKQogICAgICAgIH0sIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikudmFsdWUgPSAob3BlbmVyLm9wZW5lciB8fCB3aW5kb3cub3BlbmVyKS5yZWFkRnJvbUNsaXBib2FyZCgpOwogICAgICAgIFBhcnNlVVJMcygpOwogICAgICAgIF1dPgogICAgPC9zY3JpcHQ+Cjwvd2luZG93Pg==", "name", "top=" + (window.screenY + 50) + ",left=" + (window.screenX + 50));
    }
})();
//下载重命名
(function () {
	if (location != "chrome://mozapps/content/downloads/unknownContentType.xul") return;
	document.querySelector("#mode").addEventListener("select", function () {
		if (dialog.dialogElement("save").selected) {
			if (!document.querySelector("#locationtext")) {
				var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("textbox"), document.querySelector("#location"));
				locationtext.id = "locationtext";
				locationtext.setAttribute("style", "margin-top:-2px;margin-bottom:-3px");
				locationtext.value = document.querySelector("#location").value;
			}
			document.querySelector("#location").hidden = true;
			document.querySelector("#locationtext").hidden = false;
		} else {
			document.querySelector("#locationtext").hidden = true;
			document.querySelector("#location").hidden = false;
		}
	}, false)
	dialog.dialogElement("save").selected && dialog.dialogElement("save").click();
	window.addEventListener("dialogaccept", function () {
		if ((document.querySelector("#locationtext").value != document.querySelector("#location").value) && dialog.dialogElement("save").selected) {
			dialog.mLauncher.saveToDisk(dialog.promptForSaveToFile(dialog.mLauncher,window,document.querySelector("#locationtext").value),1);
			dialog.onCancel=null;
			document.documentElement.removeAttribute("ondialogaccept");
		}
	}, false);
	/*/另存为
	var saveas = document.documentElement.getButton("extra1");
	saveas.setAttribute("hidden", "false");
	saveas.setAttribute("label", "\u53E6\u5B58\u4E3A");
	saveas.setAttribute("oncommand", 'var file=(dialog.promptForSaveToFileAsync||dialog.promptForSaveToFile).call(dialog,dialog.mLauncher,window,dialog.mLauncher.suggestedFileName,"",true);if(file){dialog.mLauncher.saveToDisk(file,1);dialog.onCancel=function(){};close()}')
	*/
})();
//自动关闭下载产生的空白标签
(function () {
    if (location != "chrome://browser/content/browser.xul") return;
	eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
      if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
          && aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
        aWebProgress.DOMWindow.setTimeout(function() {\
          !aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
        }, 100);\
      }\
    '));
})();
