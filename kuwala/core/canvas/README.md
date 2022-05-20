# Kuwala Canvas [EXPERIMENTAL]

The Kuwala canvas enables you to build complex analytics workflows without needing to write code. You can connect your
data sources, apply transformations on top of them, and finally load them into a model or export them to your favourite
BI tool.

To start the canvas, simply
run the following command from inside the root directory:

```zsh
docker-compose --profile kuwala up
```

Now open http://localhost:3000 in your browser, and you are good to go. 🚀

## Development Mode

To run the canvas in development mode, execute the following commands from inside the `kuwala/core/canvas` directory:

1. Make sure that you have `node` installed on your machine
2. Run `npm ci`
3. Run `npm start`
4. Navigate to `localhost:3000` in your browser

To start the backend, follow the instructions in
[`kuwala/core/backend/README.md`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/core/backend).

To add an icon:

1. Modify the `IconLoader.js` file at `src/utils/IconsLoader.js`
2. Import the required icon and also add it into the `library.add()` function call.
3. To use the icon, simply call the icon string name, e.g:

```js
    <FontAwesomeIcon
        icon={'clock'}
    />
```