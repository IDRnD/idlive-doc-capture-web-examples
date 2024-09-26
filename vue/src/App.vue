<template>
  <div id="app" :class="isMobile && 'mobile'">
    <div class="camera">
      <img src="@/assets/logo.png"
        alt="logo"
        class="logo"
        v-show="!isCameraOpened"
      />
      <idlive-document-capture
        @error="error"
        @close="close"
        @detection="detection"
        @open="open"
        @initialize="initialize"
        @beforeCapture="beforeCapture"
        @capture="capture"
        @beforeOpen="beforeOpen"
        debug
        class="id-camera"
        ref="camera"
        v-show="isCameraOpened"
      ></idlive-document-capture>
    </div>
    <div id="error">{{ errorText }}</div>
    <div class="control">
      <button @click="takePhoto()" v-if="isCameraReady" :disabled="isCapturing">Capture</button>
      <button @click="openCamera()" v-if="!isCameraReady" :disabled="!isCameraLoaded || isCameraOpening">Open camera</button>
      <button @click="closeCamera()" v-if="isCameraReady">Close camera</button>
    </div>
    <div v-if="isMobile && isCameraReady">
      <button class="close-camera_mobile" @click="closeCamera()">close</button>
      <button class="capture-camera_mobile" @click="takePhoto()" :disabled="isCapturing"></button>
    </div>
    <div class="detection">
      <b>Detection error:</b> {{ detectionText }}
    </div>
    <div class="result">
      <div class="result__label">
        Results:
        <span id="result-loading" v-if="isResultsLoading"></span>
      </div>
      <ul>
        <li v-for="item in results" :key="item + Math.random()"><pre v-html="item"></pre></li>
      </ul>
    </div>
    <div class="module-version">
      Module version: {{ moduleVersion }}
    </div>
    <div class="idld-server-info">
      IDLive Doc Server{{ info }}
    </div>
    <div class="fps">
      FPS: {{ fps }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import pkg from 'idlive-document-capture-web/package.json';
import type { CaptureEvent, ErrorEvent, DetectionEvent } from 'idlive-document-capture-web';
import { EventFPSCounter } from '@/FpsCounter';

export default defineComponent({
  name: 'app',
  data: function () {
    return {
      fpsCounter: new EventFPSCounter(),
      fps: 0,
      results: [] as any[],
      errorText: '',
      detectionText: '',
      isResultsLoading: false,
      isCameraLoaded: false,
      isCameraOpened: false,
      isCameraOpening: false,
      isCameraReady: false,
      isCapturing: false,
      moduleVersion: pkg.version,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
    }
  },
  mounted() {
    // https://github.com/vuejs/core/issues/8334
    this.camera.addEventListener('detection', this.capture);
    this.camera.addEventListener('capture', this.capture);
    this.camera.addEventListener('beforeCapture', this.beforeCapture);
  },
  computed: {
    camera() {
      return this.$refs.camera as HTMLIdLiveDocumentCaptureElement;
    },
  },
  methods: {
    getApiVersion() {
        return fetch('/idld_api/api_version') // Use /api prefix
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Version:', data.version);
            this.pipelines = data.availablePipelines.filter(pipeline => !pipeline.startsWith('default-')).join(','); // Filter and store the pipelines
            this.info = `(${data.version}): ${this.pipelines}`
            return data.version;
        })
        .catch(error => {
            console.error('Failed to fetch API version:', error);
            throw error;
        });
    },
    capture(event: CaptureEvent) {
      console.log('capture', event.detail[0]);

      const { photo, encryptedFile } = event.detail[0];
      if (!photo) {
        return;
      }
      const photoData = new FormData();
      photoData.append('file', photo);

      // Append pipelines parameter to the URL
      const idldUrlWithParams = `/idld_api/check_liveness_file?pipelines=${encodeURIComponent(this.pipelines)}`;
      const iadUrlWithParams = `/iad_api/check_capture_liveness`;

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
          this.results.push(`IAD Result:\n ${JSON.stringify(iadResult, null, 2)}`); // Push the formatted IAD result to the results array
          this.results.push(`IDLD Result:\n ${JSON.stringify(idldResult, null, 2)}`); // Push the formatted IDLD result to the results array
        })
        .catch(e => {
          console.error(e);
          this.results.push(e.toString());
        })
        .finally(() => this.isResultsLoading = false);
    },
    initialize() {
      console.log('initialize');

      const detectorLicense = '<license_string>';
      this.camera.setLicense(detectorLicense, 'documentDetector');

      this.isCameraLoaded = true;
      this.fpsCounter.addEventListener('fps', this.fpsUpdated);
      this.getApiVersion()
        .then(version => {
          console.log('Fetched API Version:', version);
        })
        .catch(error => {
          console.error('Error fetching API version:', error);
        });
    },
    fpsUpdated(event: Event) {
      const customEvent = event as CustomEvent<number>;
      console.log(`fps: ${customEvent.detail}`);

      this.fps = customEvent.detail;
    },
    detection(event: DetectionEvent) {
      // console.log('detection', event.detail[0]);

      this.detectionText = event.detail[0].errors[0];
      this.fpsCounter.onEvent();
    },
    error(event: ErrorEvent) {
      console.error('error', event.detail[0]);

      this.errorText = event.detail[0].message;
    },
    open() {
      console.log('open');

      this.isCameraReady = true;
      this.isCameraOpening = false;
    },
    beforeCapture() {
      console.log('beforeCapture');

      this.isCapturing = true;
    },
    beforeOpen() {
      console.log('beforeOpen');

      this.isCameraOpening = true;
      this.isCameraOpened = true;
      this.errorText = '';
    },
    close() {
      console.log('close');

      this.detectionText = '';
      this.isCameraReady = false;
      this.isCameraOpened = false;
      this.isCameraOpening = false;
      this.isCapturing = false;
      this.fps = 0;
    },
    openCamera() {
      this.camera.openCamera();
    },
    closeCamera() {
      this.camera.closeCamera();
    },
    takePhoto() {
      this.camera.takePhoto();
    },
  }
})
</script>

<style>
body {
    background: whitesmoke;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    max-width: 800px;
    margin: auto;
}

.id-camera {
    width: 100%;
    height: 100%;
}

.control button {
    margin: 20px;
    padding: 10px;
    border: none;
    background: #4ca585;
    border-radius: 5px;
    color: white;
    font-size: 15px;
}

.control button:disabled,
.capture-camera_mobile:disabled  {
    background: #aaa;
}

#result-loading:after,
button:disabled:after  {
    content: "☼";
    display: inline-block;
    margin-left: 8px;
    animation: lds-dual-ring 2.5s linear infinite;
}

.capture-camera_mobile:disabled:after  {
    margin-left: 0;
    color: #fff;
    font-size: 2rem;
}

@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.logo {
    max-width: 600px;
    width: 100%;
}

.camera {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control {
    display: flex;
    justify-content: center;
}

.close-camera_mobile {
    position: fixed;
    right: 6vw;
    top: 2vh;
    text-shadow: 0 0 4px black;
    color: white;
    font-size: 20px;
    user-select: none;
    background: none;
    border: none;
    z-index: 104;
}

.capture-camera_mobile {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    border: 2px solid white;
    outline: none;
    background-color: red;
    position: fixed;
    left: calc(50% - 25px);
    bottom: 10px;
    z-index: 104;
}

@media screen and (orientation: landscape) and (min-width: 360px) {
    .capture-camera_mobile {
        bottom: calc(50% - 25px);
        left: auto;
        right: 5vw;
    }
}

.result {
    padding-bottom: 40px;
}

.result li {
    text-align: left;
}

.result__label {
    font-weight: bold;
    margin-top: 40px;
    font-size: 22px;
}

.detection {
    text-align: left;
    color: #a40e26;
}

#error {
    color: red;
}

.module-version {
    position: absolute;
    left: 10px;
    top: 10px;
}

.idld-server-info {
    position: absolute;
    left: 10px;
    top: 50px;
}

.fps {
    position: absolute;
    left: 10px;
    top: 30px;
    color: red;
}

.mobile .fps {
    z-index: 1000;
}
.mobile .detection {
    z-index: 1000;
    position: absolute;
    left: 10px;
    top: 50px;
}
</style>
