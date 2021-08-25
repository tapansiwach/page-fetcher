const args = process.argv.slice(2);
const url = args[0];
const filePath = args[1];

const request = require("request");
const fs = require("fs");
const { stdin } = require("process");

const fetcher = () => {
  // download the resource at the URL to the local path on machine
  request(url, (error, response, body) => {
    if (!error && response && response.statusCode === 200) {
      fs.writeFile(filePath, body, (err, data) => {
        if (!err) {
          console.log(`Downloaded and saved ${body.length} bytes to ${filePath}`);
          process.exit();
        }
      });
    }
  });
}

const fetcherWithEdgeCases = () => {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  if (!pattern.test(url)) {
    console.log("invlaid url");
    return;
  }

  // check file already exists and inform user that it will be overwritten
  fs.readFile(filePath, (err, data) => {
    let proceed = true;

    if (data) {
      proceed = false;
      process.stdout.write("file already exists and will be overwritten. do you want to proceed? (y or n): ");

      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.setEncoding("utf8");
      process.stdin.on("data", (key) => {
        if (key === "y") {
          proceed = true;
          console.log("\n\n");
          console.log("user input key=y... proceeding with overwrite");

          // download the resource at the URL to the local path on machine
          fetcher();

        } else {
          console.log("\n\n");
          console.log("user input key=n... exiting process");
          process.exit();
        }
      });
    } else {
      fetcher();
    }
  });
};

fetcherWithEdgeCases();