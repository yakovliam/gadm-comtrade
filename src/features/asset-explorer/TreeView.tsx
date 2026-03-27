import React from "react"
import { useState } from "react"

const NUM_ROWS = 100;
const ROW_HEIGHT = 18;
const ROW_DEFAULT_TEXT = "This is a row in the tree view";


const TreeView: React.FC = () => {
    return (
        // Root container
        <div className="
        w-full h-full
        overflow-scroll
        bg-(--color-box-content)    
        ">
            {/* Flex container for rows */}
            <div className="
            w-full h-full
            flex flex-col items-start justify-start
            gap-1
            ">
                {Array.from({ length: NUM_ROWS }).map((_, index) => (
                    <div key={index} className={`
                    w-full
                    h-[${ROW_HEIGHT}px]
                    border-b border-(--color-box-border)
                    text-(--color-text-high) text-sm
                    flex items-center justify-start
                    px-2
                    text-nowrap
                    `}>
                        <div className="
                        w-full
                        h-full
                        flex items-center justify-start
                        ">
                            {ROW_DEFAULT_TEXT} {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TreeView;