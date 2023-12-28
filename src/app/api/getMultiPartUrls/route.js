import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const AWS = require("aws-sdk");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { S3, UploadPartCommand } = require("@aws-sdk/client-s3");

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3Credentials = new AWS.Credentials({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

const s3 = new S3({
  region: AWS_REGION,
  credentials: s3Credentials,
});

export async function POST(req) {
  const { fileKey, uploadId, parts } = await req.json();
  console.log("get: line 25: ", { fileKey, uploadId, parts });

  let multipartParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileKey,
    UploadId: uploadId,
    Expires: 60 * 60 * 10,
  };
  const promises = [];
  for (let index = 0; index < parts; index++) {
    promises.push(
      getSignedUrl(
        s3,
        new UploadPartCommand({
          ...multipartParams,
          PartNumber: index + 1,
        })
      )
    );
  }
  console.log("line 39");
  const signedUrls = await Promise.all(promises);
  // assign to each URL the index of the part to which it corresponds
  console.log("line 42");

  const partSignedUrlList = signedUrls.map((signedUrl, index) => {
    return {
      signedUrl: signedUrl,
      PartNumber: index + 1,
    };
  });
  console.log("line 50");

  return NextResponse.json({ parts: partSignedUrlList });
}
