// Home.jsx
"use client";
import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { Label, FileInput } from "flowbite-react";
import { updateids } from "./flow/cadence/transactions/updateFileId";
import UserFiles from "@/components/getFiles";

const firebaseConfig = {
  apiKey: "AIzaSyD1WuTEKWmXAfGLXW-FAuVC9qkZn_s66ZM",
  authDomain: "uploadfile-f371c.firebaseapp.com",
  projectId: "uploadfile-f371c",
  storageBucket: "uploadfile-f371c.appspot.com",
  messagingSenderId: "374876534084",
  appId: "1:374876534084:web:bd63d7e554eeabcf679311",
  measurementId: "G-TZJV2KZL60",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();

fcl.config({
  "accessNode.api": "https://access-testnet.onflow.org",
  "discovery.wallet": `https://fcl-discovery.onflow.org/testnet/authn`,
  "flow.network": "emulator",
  "app.detail.icon": "https://avatars.githubusercontent.com/u/62387156?v=4",
  "app.detail.title": "FlowVault",
});

const Home = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [user, setUser] = useState({ loggedIn: false, addr: "" });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Configure Flow
  fcl.config({
    // ... (your Flow configuration)
  });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, [user.loggedIn, user.addr]);

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

      // Use the user's Flow address as the folder name
      const userFlowAddress = user.addr;

      // Upload each file
      for (const file of selectedFiles) {
        // Generate a random ID for the file
        const fileId = crypto.randomUUID();

        // Use Flow Client Library (fcl) to send the transaction
        await fcl.send([
          fcl.transaction(updateids),
          fcl.args([fcl.arg([fileId], types.Array(types.String))]),
          fcl.payer(fcl.authz),
          fcl.proposer(fcl.authz),
          fcl.authorizations([fcl.authz]),
          fcl.limit(9999),
        ]);

        // Upload file to Firebase Storage under the user's Flow address folder
        const storageRef = storage.ref(`${userFlowAddress}/${fileId}`);
        await storageRef.put(file);

        uploadedFilesData.push({
          id: fileId,
          url: await storageRef.getDownloadURL(),
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

  const handleLogout = () => {
    // Clear uploaded files and localStorage on logout
    setUploadedFiles([]);
    localStorage.removeItem("uploadedFiles");
    fcl.unauthenticate();
  };

  return (
    <div className="bg-white text-black flex flex-col min-h-screen">
      <header className="container mx-auto flex justify-between items-center pr-10 pt-2 pb-2">
        <div className="flex items-center">
          <img
            src="/v.jpg"
            alt="Logo"
            className="h-10 w-10 mr-2 rounded-full"
          />
          <div>
            <a href='/' className="text-lg font-semibold text-gray-800">FLOW VAULT</a>
          </div>
          <nav className="ml-6 space-x-4">
            <a href="#" className="text-gray-800 hover:text-gray-600">
              Home
            </a>
            <a href="#upload" className="text-gray-800 hover:text-gray-600">
              Upload
            </a>
            <a href="#files" className="text-gray-800 hover:text-gray-600">
              Files
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600">
              About Us
            </a>
          </nav>
        </div>
        <div>
          {!user.loggedIn ? (
            <>
              <button
                className="border rounded-lg bg-blue-700 text-white px-5 text-sm font-semibold py-2 mr-4"
                onClick={fcl.authenticate}
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              className="border rounded-xl border-black px-5 text-sm text-black hover:bg-gray-300 py-1"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <section className="flex flex-col items-center justify-center bg-black text-white w-full">
        <div className="text-4xl mt-24 text-center mb-6 font-bold">
          <span className="text-blue-600">Upload, Share</span>
          <br /> and Easily <span className="text-blue-600">Manage</span> Your
          <br /> Files
        </div>
        <div className="text-lg text-center mb-6">
          Drag and drop your files to securely store your data, leveraging the
          <br />
          power of blockchain to keep your data safe and secure.
        </div>
        {user.loggedIn ? (
          <p className="text-white text-center mb-20">Upload files below</p>
          
        ) : (
          <div className="flex space-x-4 mb-20">
            <button
              className="bg-red-500 text-white px-6 py-2 hover:bg-red-600"
              onClick={fcl.authenticate}
            >
              Get Started
            </button>
          </div>
        )}
      </section>


      <main className="container  w-full flex-1 p-5 bg-black text-white">
        {/* File Input Section */}
        <section id="upload">
        {user.loggedIn ? (
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor="dropzone-file"
              className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-800 bg-black hover:bg-[#111111] dark:border-gray-600 dark:bg-gray-700 dark:hover:border-[#111111] dark:hover:bg-[#111111]"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <svg
                  className="mb-4 h-8 w-8 text-white"
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
                <p className="mb-2 text-sm text-white">
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
                className="px-5 py-2 bg-white text-black rounded-md hover:bg-gray-200"
                disabled={selectedFiles.length === 0}
              >
                Upload
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white text-center">Login first to upload files</p>
        )}
        </section>

        {/* Display uploaded files */}
        <section id="files">
        {user.loggedIn ? (
          <>
            <UserFiles userFlowAddress={user.addr} files={uploadedFiles} />
          </>
        ) : null}
        </section>
      </main>
    </div>
  );
};

export default Home;