// Home.jsx
"use client"
import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { Label, FileInput } from "flowbite-react";
import { updatePosts } from "./flow/cadence/transactions/updateFileId";
import { getids } from "./flow/cadence/scripts/getFileId";

const firebaseConfig = {
  apiKey: "AIzaSyD1WuTEKWmXAfGLXW-FAuVC9qkZn_s66ZM",
  authDomain: "uploadfile-f371c.firebaseapp.com",
  projectId: "uploadfile-f371c",
  storageBucket: "uploadfile-f371c.appspot.com",
  messagingSenderId: "374876534084",
  appId: "1:374876534084:web:bd63d7e554eeabcf679311",
  measurementId: "G-TZJV2KZL60"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();

const Home = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [user, setUser] = useState({ loggedIn: false });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  fcl.config({
    "accessNode.api": "https://access-testnet.onflow.org",
    "discovery.wallet": `https://fcl-discovery.onflow.org/testnet/authn`,
    "flow.network": "emulator",
    "app.detail.icon": "https://avatars.githubusercontent.com/u/62387156?v=4",
    "app.detail.title": "Bitch",
  });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(Array.from(files));
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0) {
        console.error("No files selected");
        return;
      }

      const uploadedFilesData = [];

      // Upload each file
      for (const file of selectedFiles) {
        // Generate a random ID
        const id = crypto.randomUUID();

        // Use Flow Client Library (fcl) to send the transaction
        await fcl.send([
          fcl.transaction(updatePosts),
          fcl.args([fcl.arg([id], types.Array(types.String))]),
          fcl.payer(fcl.authz),
          fcl.proposer(fcl.authz),
          fcl.authorizations([fcl.authz]),
          fcl.limit(9999),
        ]);

        // Upload file to Firebase Storage
        const storageRef = storage.ref();
        const fileRef = storageRef.child(id);
        await fileRef.put(file);

        uploadedFilesData.push({
          id,
          url: await fileRef.getDownloadURL(),
        });
      }

      setUploadedFiles((prevUploadedFiles) => [
        ...prevUploadedFiles,
        ...uploadedFilesData,
      ]);

      // Clear selected files after upload
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div className="bg-[#011E30] flex flex-col min-h-screen">
      <main className="container mx-auto flex-1 p-5">
        <div className="mb-10 flex justify-between items-center pr-10 pt-2">
          <div className="flex space-x-4 items-center">
            <h1 className="text-[#38E8C6]">Address: </h1>
            <h1 className="border px-7 text-center text-[#38E8C6] text-sm py-1 rounded-xl border-[#38E8C6] w-56">
              {user.loggedIn ? user.addr : "Please connect wallet -->"}
            </h1>
          </div>
          <div>
            {!user.loggedIn ? (
              <button
                className="border rounded-xl border-[#38E8C6] px-5 text-sm text-[#38E8C6] py-1"
                onClick={fcl.authenticate}
              >
                Log In
              </button>
            ) : (
              <button
                className="border rounded-xl border-[#38E8C6] px-5 text-sm text-[#38E8C6] py-1"
                onClick={fcl.unauthenticate}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* File Input Section */}
        {user.loggedIn ? (
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor="dropzone-file"
              className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#38E8C6] bg-[#011E30] hover:bg-[#1c3a4dcb] dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <svg
                  className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLineJoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG, or GIF (MAX. 800x400px)
                </p>
              </div>
              <FileInput
                id="dropzone-file"
                className="hidden"
                onChange={handleFileInputChange}
                multiple
              />
            </Label>
            <div className="mt-4">
              {selectedFiles.length > 0 && (
                <div className="mb-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              )}
              <button
                onClick={handleUpload}
                className="px-5 py-2 bg-[#38E8C6] text-[#011E30] rounded-md hover:bg-[#38E8C6] hover:text-[#011E30]"
                disabled={selectedFiles.length === 0}
              >
                Upload
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#38E8C6] text-center">
            Login first to upload files
          </p>
        )}

        {/* Display uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-2 text-[#38E8C6]">
            {uploadedFiles.map((file) => (
              <div key={file.id}>
                Uploaded ID: {file.id}
                <br />
                <img src={file.url} alt="Uploaded File" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
