import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ShieldIcon from "@mui/icons-material/Shield";
import { UserProfile, useUser } from "@auth0/nextjs-auth0/client";
import { Strings } from "../resources/strings";
import { useRouter } from "next/router";

const pages: string[] = [];
// const settings = ["Profile", "Logout"];
let router;

const settings: Array<QuickLink> = [
  {
    name: "profile",
    displayString: Strings.profile.get(),
  },
  {
    name: "logout",
    displayString: Strings.logOut.get(),
    onClick: () => router.push("/api/auth/logout"),
  },
];

interface QuickLink {
  name: string;
  displayString: string;
  onClick?: () => void;
}

/**
 * Component String declarations
 */
const strings = {
  caasHeading: Strings.caas.get(),
  signIn: Strings.signIn.get(),
};

function userSettingsBox(
  handleOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void,
  anchorElUser: HTMLElement | null,
  handleCloseUserMenu: () => void,
  userProfile: UserProfile
) {
  return (
    <>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          {/*
      // @ts-ignore */}
          <Avatar alt={userProfile.nickname} src={userProfile.picture} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((setting) => (
          <MenuItem
            key={setting.name}
            onClick={setting.onClick ?? handleCloseUserMenu}
          >
            <Typography textAlign="center">{setting.displayString}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function quickLinksBar(handleCloseNavMenu: () => void) {
  return (
    <>
      {pages.map((page) => (
        <Button
          key={page}
          onClick={handleCloseNavMenu}
          sx={{ my: 2, color: "white", display: "block" }}
        >
          {page}
        </Button>
      ))}
    </>
  );
}

function ResponsiveAppBar() {
  router = useRouter();
  const { user, error, isLoading } = useUser();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function getSettingsBox() {
    if (user) {
      return (
        <>
          {userSettingsBox(
            handleOpenUserMenu,
            anchorElUser,
            handleCloseUserMenu,
            user
          )}
        </>
      );
    } else {
      return (
        <>
          <Button variant="contained" size={"large"} href="api/auth/login">
            {strings.signIn}
          </Button>
        </>
      );
    }
  }

  return (
    <div>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <ShieldIcon
            sx={{
              display: { xs: "none", md: "flex" },
              mr: 1,
              fontSize: 35,
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "Quicksand",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {Strings.caas.get()}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="primary"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <ShieldIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "Quicksand",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {strings.caasHeading}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {quickLinksBar(handleCloseNavMenu)}
          </Box>

          <Box sx={{ flexGrow: 0 }}>{getSettingsBox()}</Box>
        </Toolbar>
      </Container>
    </div>
  );
}

export default ResponsiveAppBar;
