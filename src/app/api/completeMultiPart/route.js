const AWS = require("aws-sdk");

const {
  S3,
} = require("@aws-sdk/client-s3");

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";

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
  const { uploadId, fileKey, parts } = await req.json();

  let multipartParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileKey,
    UploadId: uploadId,
    MultipartUpload: {
      // ordering the parts to make sure they are in the right order
      Parts: _.orderBy(parts, ["PartNumber"], ["asc"]),
    },
  };
  const completeMultipartUploadOutput = await s3
    .completeMultipartUpload(multipartParams);
  // completeMultipartUploadOutput.Location represents the
  // URL to the resource just uploaded to the cloud storage

  return NextResponse.json({});
}
