const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

const server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, "");

    let method = req.method.toLocaleLowerCase();
    let headers = req.headers;

    let decoder = new StringDecoder("utf-8");
    let payload = "";
    req.on("data", (data) => {
        payload += decoder.write(data);
    });

    req.on("end", () => {
        payload += decoder.end();

        let data = {
            method,
            path,
            payload,
            headers
        };

        let route = router[trimmedPath] ? router[trimmedPath] : router["notFound"];
        route(data, (response) => {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(response.status);
            res.end(JSON.stringify(response.payload));
        });
    });
});

server.listen(80, () => {
    console.log("Server up and listening on port 80");
});

const handlers = {};
handlers.hello = (data, callback) => {
    callback({
        status: 200,
        payload: {
            ok: true,
            message: "Welcome to the hello world API!"
        }
    });
};

handlers.notFound = (data, callback) => {
    callback({
        status: 404,
        payload: {
            ok: false,
            message: "404 - Not Found!"
        }
    });
};

const router = {
    "hello": handlers.hello,
    "notFound": handlers.notFound
};