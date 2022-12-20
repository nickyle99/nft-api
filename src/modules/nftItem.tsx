import Image from "next/image"
interface NftItemProps {
    name: string
    image: string
}

const NftItem = (props: NftItemProps) => {
    return (
        <div className="nft-container">
            <div className="image-container">
                <Image src={props.image} alt="" fill />
            </div>
            <div className="name">
                <h3>{props.name}</h3>
            </div>
        </div>
    )
}

export default NftItem
