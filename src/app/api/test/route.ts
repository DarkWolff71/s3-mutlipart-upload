import AWS from "aws-sdk";
import { S3 } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

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
  const { fileName, fileSize } = await req.json();
  const multipartParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileName,
    // ACL: "public-read",
  };
  const multipartUpload = await s3
    .createMultipartUpload(multipartParams);
  return NextResponse.json({
    uploadId: multipartUpload.UploadId,
    fileKey: multipartUpload.Key,
  });
}
