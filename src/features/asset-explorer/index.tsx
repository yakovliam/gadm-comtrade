import TreeView from "./TreeView";

// const data: TreeDataItem[] = [
//     {
//         id: '1',
//         name: 'CMH',
//         children: [
//             {
//                 id: '2',
//                 name: 'Adkins to Beatty Primary Adkins to Beatty Primary Adkins to Beatty Primary Adkins to Beatty Primary Adkins to Beatty Primary',
//                 children: [
//                     {
//                         id: '3',
//                         name: 'GE UR v1.0.0'
//                     },
//                     {
//                         id: '4',
//                         name: 'SIPROTEC 5 v1.0.0'
//                     }
//                 ]
//             },
//         ]
//     },
//     {
//         id: '6',
//         name: 'SRP',
//     }
// ]

const AssetExplorerIndex = () => {
    return (
        <div className="
        h-full w-full 

        overflow-scroll
        
        bg-gray-900
        text-white
        
        flex items-center justify-center
        ">
            <TreeView />
        </div>
    );
}

export default AssetExplorerIndex;