import logo from "./logo.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Admin from "./Dashboard/Admin";
import Loginpage from "./pages/Loginpage";
import Protect from "./pages/Protect";
import Registerpage from "./pages/Registerpage";
import Fpoadmins from "./pages/FPO/Fpoadmins";
import Addfpoadmin from "./pages/FPO/Addfpoadmin";
import Addsurvey from "./pages/Survey/Addsurvey";
import Surveylist from "./pages/Survey/Surveylist";
import Myfpo from "./pages/FPO/Myfpo";
import Allfpo from "./pages/FPO/Allfpo";
import Editsurvey from "./pages/Survey/Editsurvey";
import Allfig from "./pages/FIG/Allfig";
import LeadersList from "./pages/FIG/LeadersList";
import LeaderReqList from "./pages/FIG/LeaderReqList";
import NewsgrpsList from "./pages/News/NewsgrpsList";
import NewsgrpReqs from "./pages/News/NewsgrpReqs";
import SingleNG from "./pages/News/SingleNG";
import Singlenews from "./pages/News/Singlenews";
import Leaderpage from "./pages/FIG/Leaderpage";
import RadiocatList from "./pages/radio/RadiocatList";
import RadiocatSingle from "./pages/radio/RadiocatSingle";
import Singleradio from "./pages/radio/Singleradio";
import Addradiocat from "./pages/radio/Addradiocat";
import Addradio from "./pages/radio/Addradio";
import Unauthorisedpage from "./components/Unauthorisedpage";
import Addlanguage from "./pages/Themes/Addlanguage";
import Alllanguage from "./pages/Themes/Alllanguage";
import Themesettings from "./pages/Themes/Themesettings";
import Addseason from "./pages/radio/Addseason";
import SeasonsList from "./pages/radio/SeasonsList";
import SeasonSingle from "./pages/radio/SeasonSingle";
import Profile from "./pages/Profile";
import Resetpassword from "./pages/Resetpassword";
import Forgotpassword from "./pages/Forgotpassword";
import SurveySingle from "./pages/Survey/SurveySingle";
import ContentCreatorsList from "./pages/FIG/ContentCreatorsList";
import Addepisode from "./pages/radio/Addepisode";
import Singleepisode from "./pages/radio/Singleepisode";
import QueryList from "./pages/Query/QueryList";
import Addprivacy from "./pages/privacy & about/Addprivacy";
import Addaboutus from "./pages/privacy & about/Addaboutus";
import FigSingle from "./pages/FIG/FigSingle";
import Singlefpo from "./pages/FPO/Singlefpo";
import Optionsradio from "./pages/radio/Optionsradio";
import Allmembers from "./pages/FIG/Allmembers";
import LeaderCumCreator from "./pages/FIG/LeaderCumCreator";
import ListNotifications from "./pages/Notifications/ListNotifications";
import Addnotification from "./pages/Notifications/Addnotification";

function App() {
  return (
    <>
      {/* <Admin/> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loginpage />} />
          <Route path="/resetpassword/:id/:token" element={<Resetpassword />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          {/* <Route path="/register" element={<Registerpage />} /> */}
          <Route path="/admin" element={<Protect Component={Admin} />} />
          <Route
            path="/fpoadmins"
            element={<Protect Component={Fpoadmins} />}
          />
          <Route path="/addfpo" element={<Protect Component={Addfpoadmin} />} />
          <Route
            path="/addsurvey"
            element={<Protect Component={Addsurvey} />}
          />
          <Route
            path="/surveylist"
            element={<Protect Component={Surveylist} />}
          />
          <Route path="/myfpo" element={<Protect Component={Myfpo} />} />
          <Route path="/allfpo" element={<Protect Component={Allfpo} />} />
          <Route
            path="/editsurvey/:surveyId"
            element={<Protect Component={Editsurvey} />}
          />
          <Route path="/allfig" element={<Protect Component={Allfig} />} />
          <Route
            path="/leaderreq"
            element={<Protect Component={LeaderReqList} />}
          />
          <Route
            path="/leaders"
            element={<Protect Component={LeadersList} />}
          />
          <Route
            path="/newsgroups"
            element={<Protect Component={NewsgrpsList} />}
          />
          <Route
            path="/newsreqs"
            element={<Protect Component={NewsgrpReqs} />}
          />
          <Route
            path="/newsgrp/:gid"
            element={<Protect Component={SingleNG} />}
          />
          <Route
            path="/singlenews/:nid"
            element={<Protect Component={Singlenews} />}
          />
          <Route
            path="/member/:uid"
            element={<Protect Component={Leaderpage} />}
          />
          <Route
            path="/allradio-cat"
            element={<Protect Component={RadiocatList} />}
          />
          <Route
            path="/radio-cat/:catname/:rcid"
            element={<Protect Component={RadiocatSingle} />}
          />
          <Route
            path="/radio/:rid"
            element={<Protect Component={Singleradio} />}
          />
          <Route
            path="/addradiocat"
            element={<Protect Component={Addradiocat} />}
          />
          <Route path="/addradio" element={<Protect Component={Addradio} />} />
          <Route
            path="/unauthorised"
            element={<Protect Component={Unauthorisedpage} />}
          />
          <Route
            path="/addlanguage"
            element={<Protect Component={Addlanguage} />}
          />
          <Route
            path="/alllanguages"
            element={<Protect Component={Alllanguage} />}
          />
          <Route
            path="/themesettings"
            element={<Protect Component={Themesettings} />}
          />
          <Route
            path="/addseason"
            element={<Protect Component={Addseason} />}
          />
          <Route
            path="/seasonlist"
            element={<Protect Component={SeasonsList} />}
          />
          <Route
            path="/season/:seasonname/:seaid"
            element={<Protect Component={SeasonSingle} />}
          />
          <Route
            path="/myprofile/:id"
            element={<Protect Component={Profile} />}
          />
          <Route
            path="/singlesurvey/:sid"
            element={<Protect Component={SurveySingle} />}
          />
          <Route
            path="/contentcreators"
            element={<Protect Component={ContentCreatorsList} />}
          />
          <Route
            path="/addepisode"
            element={<Protect Component={Addepisode} />}
          />
          <Route
            path="/episode/:episodename/:epid"
            element={<Protect Component={Singleepisode} />}
          />
          <Route path="/queries" element={<Protect Component={QueryList} />} />
          <Route
            path="/addprivacy"
            element={<Protect Component={Addprivacy} />}
          />
          <Route
            path="/addaboutus"
            element={<Protect Component={Addaboutus} />}
          />
          <Route
            path="/singlefig/:fgid"
            element={<Protect Component={FigSingle} />}
          />
          <Route
            path="/singlefpo/:fpoid"
            element={<Protect Component={Singlefpo} />}
          />
          <Route
            path="/radiooptions"
            element={<Protect Component={Optionsradio} />}
          />
          <Route path="/members" element={<Protect Component={Allmembers} />} />
          <Route
            path="/leaderCUMcreator"
            element={<Protect Component={LeaderCumCreator} />}
          />
          <Route
            path="/allnotifications"
            element={<Protect Component={ListNotifications} />}
          />
          <Route
            path="/addnotification"
            element={<Protect Component={Addnotification} />}
          />
          {/* /radio-cat */}
          {/* <Route path="/notifications" element={<Protect Component={Notifications} />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
