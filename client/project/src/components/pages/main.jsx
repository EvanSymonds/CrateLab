import React from "react";
import FileSystem from "../complex/fileSystem"
import { ThemeProvider } from "@material-ui/core/styles"
import { redGreyTheme, darkModeTheme } from "../../themes"

const Main = (props) => {

  return(
    <ThemeProvider theme={darkModeTheme}>
      <div data-test="component-main">
        <FileSystem />
      </div>
    </ThemeProvider>    
  )
}

export default Main;