

/**************************************************************************************************************************************
 *                                                 DEFINE SOLUTION EXTENSION
 **************************************************************************************************************************************/

// DEFINE THE PROPERTIES & ATTRIBUTES
let uploadAttachmentConfig = {
    name: "uploadAttachment", // Unique control name. Must match value for the control_nm column in dh_control.
    category: "Custom", // Category from the dh_control_category table (control_category_id 4).
    directiveName: "upload-attachment", // This name is also referenced when defining the custom element at the end of the code.
    displayName: {
        defaultText: "Upload Attachment"  // The name of the solution extension that appears with the other controls in VI pagebuilder.
    },
    controlDescription: {
        defaultText: "Simple control to display mode and state"  // This description is deprecated, so it can be left blank.
    },
    controlAttributes: {
        metadata: {
            renderAs: "webcomponent",  // It is crucial to define the solution extension as a webcomponent.
            states: {
				readOnly: true,
                required: true, 
                hidden: true 
            }
        }       
    }
};

// REGISTER THE CONFIG WITH VI
window.sas.vi.config.registerSolutionExtension(uploadAttachmentConfig);



/***********************************************************************************************************************************
 *                                                    CREATE WEB COMPONENT
 ***********************************************************************************************************************************/

let uploadAttachmentTemplate = document.createElement("template");
uploadAttachmentTemplate.innerHTML = `
	<html dir="rtl" lang="ar">
		<head>
			<meta charset="utf-8">
		
		<style>
		body {font-family: Arial, Helvetica, sans-serif; font-size:medium;}
		* {box-sizing: border-box;}

		/* The popup form - hidden by default */
		.form-popup {
			display: none;
		    position: fixed;
			bottom: -5%;
			width: 95%;
			height: 500px;
			margin-top: -100px;
			z-index: 9;
			closable: "true";
		}

		/* Add styles to the form container */
		.form-container {
		  margin-left: 28%;
		  margin-top: 10%;
		  max-width: 500px;
		  padding: 0px;
		  background-color: white;
		}

		/* Full-width input fields */
		.form-container textarea[type=textarea], .form-container textarea[type=textarea] {
			font-family: Arial, Helvetica, sans-serif;
			width: 480px;
			padding: 8px;
			margin: 10px 10px 22px 0px;
			border: none;
			background: white;
			text-align: right;
			vertical-align: ;
			vertical-align: top;
			border-radius: 4px;
			border-color: #a9a9a9;
			border-width: 1px;
			border-style: inset;
		}

		/* When the inputs get focus, do something */
		.form-container textarea[type=textarea]:focus, .form-container textarea[type=textarea]:focus {
		  background-color: #ddd;
		  outline: none;
		}

		/* Set a style for the submit/close button */
		.form-container .btn {
		  background-color: #8a1739;
		  color: white;
		  padding: 10px 10px;
		  border: none;
		  cursor: pointer;
		  width: 20%;
		  margin-bottom:10px;
		  margin-top:20px;
		  margin-left:10px;
		  border-radius:4px;
		  font-family: Arial, Helvetica, sans-serif;
		  font-weight:bold;
		  
		}



		/* Add some hover effects to buttons */
		.form-container .btn:hover, .open-button:hover {
		  opacity: 0.8;
		}
		</style>
		</head>
		
		<div style="margin-top:20px">
            <div class="ai-drop-area">
                <div class="ai-drop-area-content-parent">
                    <div class="ai-drop-area-content-wrapper"
                        style="display: table; table-layout: fixed; width: 250px; height: 250px; margin: 0 auto;  left: calc(50% - 300px/2)">
                        <div class="ai-drop-area-content"
                            style="    display: table-cell; vertical-align: middle; text-align: center; border: 1px solid #cdcdcd; border-radius: 50%; transition-property: background,border; transition-duration: .5s;">
                            <!--	<sng-zero-state icon="zeroStateAddIcon">   -->
                            <div>
                                <sng-zero-state icon="zeroStateAddIcon"></sng-zero-state>
                                
                            </div>
                            <h1 style="font-size:large;">رفع الملفات</h1>
                            <div class="ai-drop-area-desc"></div>
                            <div class="ai-drop-area-buttons" style="margin-top: 2rem;  display: inline-block;">
                                <label class="ai-file-chooser-button"
                                    style="position: relative; background: #8a1739; color:white; width:50px; height:40px; font-weight:bold;  border: 1px solid #cdcdcd; border-radius: 4px; padding: 2px 10px 4px 10px; line-height: normal; margin-bottom: 0;  user-select: none; cursor: pointer;  ">
                                    <input type="file" multiple class="ai-file-upload-button" name="fileChooser" id="fileUpload"
                                        
                                        style="width: 0.1px; height: 0.1px;  opacity: 0;  overflow: hidden;  position: absolute;  z-index: -1; display: block;" />
                                    اسـتـعراض
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
		
		<div class="form-popup" id="myForm">
			<form  class="form-container">
				<div  style="display: table;  width:100%; background: #8a1739; font-size:medium; height:80px; font-family: Arial, Helvetica, sans-serif; font-weight:bold; text-align:center; color:white;">
					<div style="display: table-cell; vertical-align: middle;">
						<div>
						إضافة وصف الملف
						</div>
					</div>
				</div>
				<div style="margin-top:10px; text-align:right; font-family: Arial, Helvetica, sans-serif; font-size:medium;">
					<label style="margin-right:10px;"><b>وصف الملف</b></label>
					<textarea type="textarea" contenteditable="true" id="description" dir="rtl" placeholder="إضافة الوصف" name="description" autocomplete="off"></textarea> 
					
					
				</div>
				<button id="close" type="button" class="btn">إلغاء</button>
				<button id="confirm" type="button" class="btn" >تـأكيـد</button>
		  </form>
		</div>
	</html>
`;


//                 ****************DEFINE THE CLASS ELEMENT*************************
// The name we use for the class needs to be in CamelCase and the first letter must be capitalized.
// This name is also referenced when we define our customElement in the code below.
class uploadAttachmentControl extends HTMLElement {

    // The .attachShadow() method attaches a shadow DOM tree to the specified element and returns a reference to its ShadowRoot.
    // mode: "open" means that elements of the shadow root are accessible from JavaScript outside the root.
    shadow = this.attachShadow({ mode: "open" });
    
    // Declare a variable for ControlApi so that we may access it.
    controlApi;
    httpApi;
	fileApi;
	
	// Declare variables to be used later
	uploadButton;
	popup;
	confirmButton;
	closeButton;
	
    // A function to access the "required" state in the solution extension attributes.
    get required() { return !!this.controlApi?.control.state.required; }

    // A function to access the "allowInput" state in the solution extension attributes.
    get disabled() { return !this.controlApi?.control.state.allowInput; }

    // A function to access the "read-only" state of the solution extension.
    get readOnly() { return !!this.controlApi?.control.state.readOnly; }

    // A function to access the mode of the solution extension.
    get mode() { return this.controlApi?.page.getMode(); }
	

    // Set the "required-indicator" tag to be either required * or not "".
    onRequiredChange() {
        if (this.requiredIndicator) {
            this.requiredIndicator.innerHTML = this.required ? "*" : "";
        }
    }

    // This function looks for the read-only state.
    onReadOnlyChange() {
        if (this.readOnly) {
            this.classList.add("read-only");
        } else {
            this.classList.remove("read-only");
        }
        this.handleDisabled();
    }
	
	closeForm() {
		this.popupstyle.display = "none";
	}
		
    // create an instance of the control by adding the template to the (shadow)DOM.
    constructor() {
        super();
        this.shadow.appendChild(uploadAttachmentTemplate.content.cloneNode(true)); 
    }

    // ConnectedCallback() is triggered when the control is added to the page, or moved on the page.
    // A "move" acts as a delete+add, and therefore the callback is triggered twice.
    connectedCallback() {
		
		// Get entity_name & object_id from controlApi
		var object_id = this.controlApi?.control.pageModel.id;
		var entity_name = this.controlApi?.control.pageModel.type;
		
		//Create variable for the button
		var uploadButton = this.shadow.getElementById("fileUpload");
		
	
		var popup = this.shadow.getElementById("myForm");
		var description = this.shadow.getElementById("description");
		var confirmButton = this.shadow.getElementById("confirm");
		var closeButton = this.shadow.getElementById("close");
		
		
		// Add an event listener to the button
		uploadButton.addEventListener("change", function(event){
			
			let files = event.target.files;
            console.log("Files",event.target.files);
            
			if (files.length > 0){
				console.log("File Selected");

				popup.style.display = "block";
				
				
				popup.addEventListener("keypress",function(e) {
					if (e.which == 13) {
						return false;
					}
				});
				closeButton.addEventListener("click", function(){
					console.log("الغاء");
					popup.style.display = "none";
					files = [];
				});
					

				confirmButton.addEventListener("click", function(){
					if(description.value != ""){
						popup.style.display = "none";
						console.log(description.value);
						console.log("Starting Upload");
						//let files = event.target.files; 	// Get Selected File
						var f = files[0];
						f.description = description.value;
									
						window.sas.vi.file.uploadToViFolder(f).then(function (resp){   	// Upload File to the file service on SAS VI
							resp.name = f.name;
							resp.description = description.value;
							resp.location = "/files/files/"+resp.id;
							console.log(resp);
							// Create the attachment metadata for this uploaded file
							window.sas.vi.http.post("/svi-datahub/documents/"+entity_name+"/"+object_id+"/attachments",resp).then(function(resp2){
								location.reload();
							});
						});
					}
					else{
						console.log("No Value");
					}
				});
			}
		});
		
    }

}

// DEFINE a new HTML element ("custom element" or custom tag).
customElements.define("upload-attachment", uploadAttachmentControl);
