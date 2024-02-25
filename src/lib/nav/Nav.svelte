<script lang="ts">
  import { page } from "$app/stores";
  import NavItem from "./NavItem.svelte";
  import { onDestroy } from "svelte";
  import SettingsIcon from "svelte-fluentui-icons/icons/Settings_Filled.svelte";
  import SignOutIcon from "svelte-fluentui-icons/icons/SignOut_Filled.svelte";
  import PersonIcon from "svelte-fluentui-icons/icons/Person_Filled.svelte";
	import DataLineIcon from "svelte-fluentui-icons/icons/DataLine_Filled.svelte";
	import FolderIcon from "svelte-fluentui-icons/icons/Folder_Filled.svelte";
  let isAdmin = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="nav">
	<NavItem url="/">
		<DataLineIcon />
		Daten
	</NavItem>
	<NavItem url="/files">
		<FolderIcon />
		Dateien
	</NavItem>
  <!-- div is used to get the navitems after it to the bottom -->
  <div id="nav-bottom"></div>
  <!-- <NavItem url="profile">
    <PersonIcon />
    Profil
  </NavItem> -->
  <NavItem url="/settings">
    <SettingsIcon />
    Einstellungen
  </NavItem>
  <!-- <NavItem url="logout">
    <SignOutIcon />
    Abmelden
  </NavItem> -->
</div>

<style>
  #nav {
    background-color: rgba(29, 29, 29, 0.5);
    backdrop-filter: blur(15px);
    padding: 10px;
    padding-left: 5px;
    display: flex;
    flex-direction: column;
    width: 20%;
    border: 2px solid rgba(46, 46, 46, 0.8);
    border-left: none;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    height: 85vh;
    animation: slideIn 800ms forwards cubic-bezier(0.83, 0, 0.17, 1);
    z-index: 999;
    view-transition-name: nav;
  }

  #nav-bottom {
    flex-grow: 1;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0%);
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-100%);
    }
  }

  @media(max-width: 900px) {
    #nav {
      position: fixed;
      /* display: none; */
      width: 80%;
    }
    .closed {
      display: none !important;
    }
    .closing {
      animation: slideOut 800ms forwards ease-in-out !important;
    }
  }
</style>
