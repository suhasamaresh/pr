// Home.jsx
"use client"
import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import { Label, FileInput } from "flowbite-react";
import { updatePosts } from "./flow/cadence/transactions/updateFileId";
import { getids } from "./flow/cadence/scripts/getFileId";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState({ loggedIn: false });

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
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        console.error("No file selected");
        return;
      }

      // Generate a random ID
      let id = crypto.randomUUID();

      // Use Flow Client Library (fcl) to send the transaction
      const transactionId = await fcl
        .send([
          fcl.transaction(updatePosts),
          fcl.args([fcl.arg([id], types.Array(types.String))]),
          fcl.payer(fcl.authz),
          fcl.proposer(fcl.authz),
          fcl.authorizations([fcl.authz]),
          fcl.limit(9999),
        ])
        .then(fcl.decode);

      console.log("Transaction ID:", transactionId);
      console.log(id);
    } catch (error) {
      console.error("Error uploading file:", error);
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
              />
            </Label>
            <div className="mt-4">
              {selectedFile && <div className="mb-2">{selectedFile.name}</div>}
              <button
                onClick={handleUpload}
                className="px-5 py-2 bg-[#38E8C6] text-[#011E30] rounded-md hover:bg-[#38E8C6] hover:text-[#011E30]"
                disabled={!selectedFile}
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
      </main>
    </div>
  );
};

export default Home;
