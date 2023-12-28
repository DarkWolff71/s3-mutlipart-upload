import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3, UploadPartCommand } from "@aws-sdk/client-s3";

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new S3({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
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
