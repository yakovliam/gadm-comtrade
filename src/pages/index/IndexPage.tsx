import DockviewHost from "@/windowmanager/dockview/DockviewHost";

const IndexPage: React.FC = () => {
    return (
        <div className="grow flex flex-col items-center justify-center">
            <DockviewHost />
        </div>
    );
};

export default IndexPage;