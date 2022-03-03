import React, {useState} from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const dummy = [
    {
        isSelected: false,
        "id": "postgres",
        "name": "Postgres",
        "logo": "https://wiki.postgresql.org/images/9/9a/PostgreSQL_logo.3colors.540x557.png",
        "connection_parameters":[
            {
                "id": "host",
                "name": "Host",
                "type": "string"
            },
            {
                "id": "port",
                "name": "Port",
                "type": "integer"
            },
            {
                "id": "user",
                "name": "User",
                "type": "string"
            },
            {
                "id": "password",
                "name": "Password",
                "type": "string"
            },
            {
                "id": "database",
                "name": "Database",
                "type": "string"
            }
        ]
    },
    {
        isSelected: false,
        "id": "postgres",
        "name": "Postgres",
        "logo": "https://wiki.postgresql.org/images/9/9a/PostgreSQL_logo.3colors.540x557.png",
        "connection_parameters":[
            {
                "id": "host",
                "name": "Host",
                "type": "string"
            },
            {
                "id": "port",
                "name": "Port",
                "type": "integer"
            },
            {
                "id": "user",
                "name": "User",
                "type": "string"
            },
            {
                "id": "password",
                "name": "Password",
                "type": "string"
            },
            {
                "id": "database",
                "name": "Database",
                "type": "string"
            }
        ]
    },
]

export default () => {
    // TODO: Move this to state store
    const [ds, setDS] = useState(dummy)
    const navigate = useNavigate();

    const updateSelectionIndicator = (index) => {
        const newDS = [...ds]
        newDS[index].isSelected = !newDS[index].isSelected;
        setDS(newDS)
    }

    const generateSelectedArray = () => {
        // TODO: Set the selected & create state store
        console.log(ds.filter((e) => e.isSelected))
    }

    const renderDataSources = () => {
        if(dummy.length <= 0){
            return (
                <div>
                    No Data Sources Available
                </div>
            )
        }

        // TODO: Figure out how to create grid elements
        return dummy.map((e,i) => {
            return (
                <div>
                    <div
                        className={`
                            flex flex-col justify-center items-center bg-white rounded-xl cursor-pointer
                            ${e.isSelected ? 'border-kuwala-green border-4' : ''}
                        `}
                        key={i}
                        style={{width: 148, height:148}}
                        onClick={() => {
                            // Set as an Active
                            updateSelectionIndicator(i)
                        }}
                    >
                        <img
                            src={e.logo}
                            style={{height: 72, width: 72}}
                        />
                        <span>{e.name}</span>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900`}>
            <Header />
            <main className={'flex flex-col h-full w-full bg-kuwala-bg-gray py-12 px-20'}>
                <span className={'font-semibold text-3xl'}>
                    Data Sources
                </span>
                <span className={'font-light text-xl mt-3'}>
                    Select the data source you want to connect
                </span>

                {/* Data Sources Container*/}
                <div className={'bg-red-300 mt-10 h-5/6 space-y-2'}>
                        {renderDataSources()}
                </div>

                <div className={'flex flex-row-reverse'}>
                    <button
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 hover:text-stone-300'}
                        onClick={()=>{
                            generateSelectedArray()
                            navigate('/')
                        }}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    )
}