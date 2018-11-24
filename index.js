const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

//create server
const server = http.createServer((req, res) => {
    //get the request path
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, "");

    //get the request method
    let method = req.method.toLocaleLowerCase();

    //get the request headers
    let headers = req.headers;

    //get the payload if any
    let decoder = new StringDecoder("utf-8");
    let payload = "";
    req.on("data", (data) => {
        payload += decoder.write(data);
    });

    //process request
    req.on("end", () => {
        payload += decoder.end();

        let data = {
            method,
            path,
            payload,
            headers
        };

        //get the requested route and send response
        let route = router[trimmedPath] ? router[trimmedPath] : router["notFound"];
        route(data, (response) => {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(response.status);
            res.end(JSON.stringify(response.payload));
        });
    });
});

//start server on port 80
server.listen(80, () => {
    console.log("Server up and listening on port 80");
});

//create handlers
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

//create router
const router = {
    "hello": handlers.hello,
    "notFound": handlers.notFound
};