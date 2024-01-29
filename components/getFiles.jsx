// UserFiles.jsx
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const UserFiles = ({ userFlowAddress }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        // Get a reference to the user's folder in Firebase Storage
        const userFolderRef = firebase.storage().ref().child(userFlowAddress);

        // List all items in the folder
        const listResult = await userFolderRef.listAll();

        // Convert items to an array
        const items = listResult.items;

        // Fetch download URLs for each file in the folder
        const fileDataPromises = items.map(async (item) => {
          const url = await item.getDownloadURL();
          return { id: item.name, url };
        });

        const fileData = await Promise.all(fileDataPromises);
        setFiles(fileData);
      } catch (error) {
        console.error("Error fetching user files:", error);
      }
    };

    fetchUserFiles();
  }, [userFlowAddress]);

  const handleDelete = async (fileId) => {
    try {
      // Get a reference to the file in Firebase Storage
      const fileRef = firebase.storage().ref().child(`${userFlowAddress}/${fileId}`);

      // Delete the file
      await fileRef.delete();

      // Update the state to reflect the deletion
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div>
      <h2>User Files</h2>
      <p>User Flow Address: {userFlowAddress}</p>
      {files.length > 0 ? (
        <div>
          {files.map((file) => (
            <div key={file.id} className="mt-10">
              Uploaded ID: {file.id}
              <br />
              <img
                src={file.url}
                alt="Uploaded File"
                className="mt-2 max-w-full h-auto"
              />
              <button onClick={() => handleDelete(file.id)} className="text-white bg-red-800 rounded-full pt-2 pb-2 pl-4 pr-4 mt-1">Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No files uploaded by the user.</p>
      )}
    </div>
  );
};

export default UserFiles;