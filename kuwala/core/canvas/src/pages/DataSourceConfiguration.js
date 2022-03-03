import React from "react";
import Header from "../components/Header";

export default () => {
    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900`}>
            <Header />
            Data Source Configuration
        </div>
    )
}