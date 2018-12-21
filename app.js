import express from 'express';
const app = express();
import { config, S3 } from 'aws-sdk';
import { readFileSync } from 'fs';
import fileType from 'file-type';
import bluebird from 'bluebird';
import { Form } from 'multiparty';
import "@babel/polyfill";
// configure the keys for accessing AWS
config.update({
    "accessKeyId": "***********",
    "secretAccessKey": "******************",
    "region": "us-west-2"
});

// configure AWS to work with promises
config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: "********",
        ContentType: type.mime,
        Key: `${name}.${type.ext}`
    };
    return s3.upload(params).promise();
};

// Define POST route
app.post('/api/v1/upload', (request, response) => {
    const form = new Form();
    form.parse(request, async (error, fields, files) => {
        if (error) throw new Error(error);
        try {
            const path = files.image[0].path;
            const buffer = readFileSync(path);
            const type = fileType(buffer);
            const timestamp = Date.now().toString();
            const fileName = `bucketFolder/${timestamp}-lg`;
            const data = await uploadFile(buffer, fileName, type);
            return response.status(200).send(data);
        } catch (error) {
            return response.status(400).send(error);
        }
    });
});
// you can use this function when upload one or more than one image at a time..............
app.post('/api/v1/uploadMultiImage', (request, response) => {
    const form = new Form();
    form.parse(request, (error, fields, files) => {
        if (error) throw new Error(error);
        else {    
            var array = []
            files.image.map(ele => {
                const path = ele.path;
                const buffer = readFileSync(path);
                const type = fileType(buffer);
                const timestamp = Date.now().toString();
                const fileName = `bucketFolder/${timestamp}-lg`;
                uploadFile(buffer, fileName, type).then(data => {
                    array.push(data)
                    if (array.length == files.image.length) return response.status(200).send(array);
                }).catch(err => {
                    console.log('Error.')
                })
            })
        }
    });
});















var PORT = 5000
app.listen(PORT, (req, res) => {
    console.log("Node.js Server Listening on port [ " + PORT + "  ].....Let's Enjoy")
})

