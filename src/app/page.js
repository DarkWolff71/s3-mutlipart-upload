"use client";

import React, { useState } from "react";
import axios from "axios";

export default function page() {
  let [file, setFile] = useState(null);
  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleUpload() {
    let partsInfo = [];
    let createResp = await axios.post(
      "http://localhost:3000/api/createMultiPart",
      {
        fileName: file.name,
        fileSize: file.size,
      }
    );
    console.log("line 18");
    let uploadId = createResp.data.uploadId;
    let getUrlsResp = await axios.post(
      "http://localhost:3000/api/getMultiPartUrls",
      {
        fileKey: file.name,
        uploadId: uploadId,
        parts: Math.ceil(file.size / (50 * 1000 * 1000)),
      }
    );
    console.log("line 28");

    let presignedUrls = getUrlsResp.data.parts;
    let totalParts = Math.ceil(file.size / (50 * 1000 * 1000));
    console.log("Total parts: ", totalParts);
    for (let i = 0; i < presignedUrls.length; i++) {
      let partNumber = presignedUrls[i].PartNumber;
      let url = presignedUrls[i].signedUrl;
      let startByte = (partNumber - 1) * (file.size / totalParts);
      let endByte = Math.min(partNumber * (file.size / totalParts), file.size);

      let part = file.slice(startByte, endByte);
      let partResponse = await fetch(url, { method: "PUT", body: part });
      let partInfo = {
        PartNumber: partNumber,
        ETag: partResponse.headers.get("ETag")?.replace(/"/g, ""),
      };
      console.log("line 43: ", partInfo);
      partsInfo.push(partInfo);
      console.log("line 45: ", partsInfo);
    }
    axios.post("http://localhost:3000/api/completeMultiPart", {
      fileKey: file.name,
      uploadId: uploadId,
      parts: partsInfo,
    });
    console.log("line 52");
  }

  return (
    <div className="flex items-center justify-center text-white">
      <input type="file" onChange={handleFileChange}></input>
      <button className="p-5 rounded bg-slate-600" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}
