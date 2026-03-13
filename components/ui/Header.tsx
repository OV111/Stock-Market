import NavItems from "./NavItems";

const Header = () => {
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <NavItems />
      </div>
    </header>
  );
};

export default Header;
