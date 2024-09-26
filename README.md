# idlive-document-capture-web

## Running the Example

To help you get started, we have provided an example for the popular Vue.js framework. Follow the steps below to run the example:

1. Ensure you have the necessary prerequisites installed, such as Node.js and npm.
2. Clone the repository and navigate to the project directory.
3. Run the example using the following command, replacing `<path_to_capture_library>` and `<path_to_license_file>` with the actual paths to your capture library and license file:

```bash
./run_example vue <path_to_capture_library> <path_to_license_file>
```

This command will set up and run the example application, allowing you to see the document capture component in action within a Vue.js environment.

Feel free to explore and modify the example to suit your needs.

## Installation

Install node js latest version for [your system](https://nodejs.org/en/download/)

Install package in your app (replace `./idlive-document-capture-web.tgz` with path to provided archive file)

```sh
npm i idlive-document-capture-web file:./idlive-document-capture-web.tgz
```

Import the component into your app

```js
import 'idlive-document-capture-web';
```

Add the component's html tag to the place on the page where you want to display the video from the camera

```html
<idlive-document-capture></idlive-document-capture>
```

**NOTE:** The component occupies 100% of the parent's element. Make sure it has a non-zero height and width

The component has the following optional attributes:

1. `mask_hidden` - do not show the document mask
2. `auto_capture_disabled` - disable auto capture after document detection
3. `auto_close_disabled` - do not close camera after taking a photo
4. `audio_enabled` - request media stream with audio
5. `payload_size` - size of produced payload, available values: "normal" (default) and "small"
6. `device_id` - device ID of the specific camera to be opened
7. `capture_mode` - capture mode, available values: "encryptedPayload" (default) and "singleImage"

```html
<idlive-document-capture mask_hidden></idlive-document-capture>
```

### Actions

You can interact with the component using the following methods:

1. `openCamera` - open camera and show video
2. `takePhoto` - take photo
3. `closeCamera` - close camera
4. `setEncryptionKey` - set encryption key
5. `setLicense` - set license

```js
const idliveDocCapture = document.querySelector('idlive-document-capture');

idliveDocCapture.openCamera();
```

### Events

The component emits the following events:

1. `initialize` - the component is initialized and ready to open camera
2. `beforeOpen` - the camera starts to open
3. `open` - the camera is open and element is ready to show video
4. `documentDetection` - document detection result
5. `beforeCapture` - the capture process started
6. `capture` - the capture process completed
7. `close` - the camera was closed
8. `error` - a critical error occurred

```js
idliveDocCapture.addEventListener('initialize', (event) => {
    // the component is ready, now you can open camera
});
```

### Example of the implementation of communication with servers

```js
    const { photo, encryptedFile } = event.detail[0];
    if (!photo) {
        return;
    }
    const photoData = new FormData();
    photoData.append('file', photo);

    const idldServerUrl = 'https://IDLD_SERVER_URL:PORT';
    const idldUrlWithParams = `${idldServerUrl}/check_liveness_file?pipelines=default-sr,default-pc,default-ps`;

    const iadServerUrl = 'https://IAD_SERVER_URL:PORT';
    const iadUrlWithParams = `${iadServerUrl}/check_capture_liveness`;

    this.isCapturing = false;
    this.isResultsLoading = true;

    const idldRequest = fetch(idldUrlWithParams, {
        method: "post",
        body: photoData
    }).then(response => response.json());

    const iadRequest = fetch(iadUrlWithParams, {
        method: "post",
        headers: { 'Content-Type': 'application/octet-stream' },
        body: encryptedFile
    }).then(response => response.json());

    Promise.all([idldRequest, iadRequest])
        .then(([idldResult, iadResult]) => {
            // process results from the server
        })
        .catch(e => {
            // error
        });
```
