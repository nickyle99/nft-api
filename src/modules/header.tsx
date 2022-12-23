import Image from "next/image"

const Header = () => {
    const goToHome = () => {
        window.location.pathname = ""
    }

    return (
        <div className="header">
            <div className="home-container" onClick={goToHome}>
                <div className="image">
                    <Image src="/../public/favicon.ico" alt="" fill></Image>
                </div>
                <div className="text">
                    <p>HOME</p>
                </div>
            </div>
        </div>
    )
}

export default Header
