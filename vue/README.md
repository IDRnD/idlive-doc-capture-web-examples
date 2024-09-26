# ID Live Doc IAD Capture

## Install dependencies

1. Place capture library into `libs` folder with name `idlive-document-capture-web.tgz`
2. Install dependencies:

    ```bash
    npm run install-dependencies
    ```

3. Fill license string in `src/App.vue`:

    ```js
    const detectorLicense = '<license_string>';
    ```

## Compiles and hot-reloads for development

```bash
npm run dev
```

## Compiles for production

```bash
npm run build
```

## Backend connection setup

1. Go to `vite.config.ts`
2. Write IDLive Doc Server address to `/idld_api` field
3. Write IAD Server address to `/iad_api` field

## Building & running using Docker

1. Build the image using:
   docker build -t idlive-document-capture-vue .
2. Run the image using:
   docker run -it --rm -p 8080:80 idlive-document-capture-vue
3. Navigate to `http://localhost:8080/`
