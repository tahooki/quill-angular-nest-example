import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuillModules } from 'ngx-quill';
import { base64StringToBlob } from 'blob-util';

declare const CKEDITOR;
declare const Quill;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  quillModules: QuillModules;
  quill: any;

  content: any = '';

  toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],     // toggled buttons
    [{'align': []}],
    [{'color': []}, {'background': []}],           // dropdown with defaults from theme
    [{'font': []}],
    ['image'],

    // ['blockquote', 'code-block'],
    //
    // [{'header': 1}],                               // custom button values
    // [{'list': 'ordered'}, {'list': 'bullet'}],
    // [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
    // [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
    // [{'direction': 'rtl'}],                        // text direction
    //
    // [{'size': ['small', false, 'large', 'huge']}], // custom dropdown
    // [{'header': [1, 2, 3, 4, 5, 6, false]}],
    //
    // [{'color': []}, {'background': []}],           // dropdown with defaults from theme
    // [{'font': []}],
    //
    // ['clean'],                                     // remove formatting button
  ];


  constructor(private _http: HttpClient) {
  }

  ngOnInit(): void {

    console.log('???', this.content);

    this.quillModules = {
      toolbar: {
        container: this.toolbarOptions,
        handlers: {
          image: () => {
            this._imageHandler()
          }
        }
      },
      // https://www.npmjs.com/package/quill-image-resize
      imageResize: {
        modules: ['DisplaySize', 'Toolbar', 'Resize'],
        handleStyles: {
          backgroundColor: 'black',
          border: 'none',
          color: 'white'
          // other camelCase styles for size display
        }
      },

      // https://www.npmjs.com/package/quill-image-drop-and-paste
      imageDropAndPaste: {
        // add an custom image handler
        handler: (imageDataUrl, type) => {
          this._uploadImage(imageDataUrl, type);
        }
      }
    };

    console.log('??');
    this._http.get('http://localhost:3000/content').subscribe((res: any) => {
      console.log('get content', res);
      this.content = res.content;
    })
  }

  onCreatedQuill(editorInstance) {
    this.quill = editorInstance;
  }

  onClickSave(quill) {
    console.log('quill', quill);
    // console.log(quill.editorElem.innerHTML);
    console.log('content', this.content);

    this._http.post('http://localhost:3000/content', {
      content: this.content
    }).subscribe(res => {
      console.log('res', res);
    });
  }

  private _imageHandler() {
    const fileInput: any = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');

    fileInput.addEventListener('change', () => {
      if (fileInput.files != null && fileInput.files[0] != null) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          const imageDataUrl = e.target.result;
          const type = imageDataUrl.split('data:')[1].split(';')[0];
          this._uploadImage(imageDataUrl, type);
          fileInput.value = "";
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });

    fileInput.click();
  }

  private _uploadImage(imageDataUrl, type) {
    const blobString = base64StringToBlob(imageDataUrl.replace(/^data:image\/\w+;base64,/, ''), type);
    const filename = [Math.floor(Math.random() * 1e12), '-', new Date().getTime(), '.', type.match(/^image\/(\w+)$/i)[1]].join('');

    const file = new File([blobString], filename, {type: type});

    const formData = new FormData();
    formData.append('upload', file);

    this._http.post('http://localhost:3000/upload', formData).subscribe(res => {
      console.log('_uploadImage post content', res);

      const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
      if (index) {
        this.quill.insertEmbed(index, 'image', res, 'user');
      }
    });
  }
}
