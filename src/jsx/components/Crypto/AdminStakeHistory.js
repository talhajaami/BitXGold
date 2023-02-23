import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
//import {NavLink} from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  Nav,
  Tab,
  Badge,
} from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
//Import Components
import { ThemeContext } from "../../../context/ThemeContext";
import USDT from "../../../contractAbis/USDT.json";
//import ServerStatusBar from './Dashboard/ServerStatusBar';

import OrderTab from "../Trading/Future/OrderTab";
import TradeTab from "../Trading/Future/TradeTab";
//images

import axiosInstance from "../../../services/AxiosInstance";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { useRef } from "react";
import ClaimTab from "../Trading/Future/ClaimTab";
import DateRangePicker from "react-bootstrap-daterangepicker";
import moment from "moment";

const AdminStakeHistory = () => {
  const { t } = useTranslation();

  const [date, setdate] = useState("");
  const [dataMain, setdataMain] = useState([]);
  const [stakeItems, setStakeItems] = useState([]);
  const [loader, setLoader] = useState(false);
  const state = useSelector((state) => state);
  const [requests, setRequests] = useState([]);
  const [data, setData] = useState([]);
  const sort = 6;
  const activePag = useRef(0);
  const [test, settest] = useState(0);

  var today = new Date();
  today.setDate(today.getDate() + 1);
  // variable for month back date
  var monthBack = new Date();
  monthBack.setDate(monthBack.getDate() - 30);
  const getFormattedDate = (date) => {
    //get only day and month in english
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.toLocaleString("default", { month: "short" });
    const day = d.getDate();
    return `${day} ${month} ${year}`;
  };
  // Active data
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };

  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(
    Math.ceil(requests.filter((item) => item.type === "Stake").length / sort)
  )
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    settest(i);
  };
  // use effect
  useEffect(() => {
    setTimeout(() => {
      setData(document.querySelectorAll("#future_wrapper tbody tr"));
      setLoader(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setData(document.querySelectorAll("#future_wrapper tbody tr"));
      setLoader(false);
    }, 1000);
  }, [requests]);

  const interval = setInterval(() => {
    setStakeItems(stakeItems);
  }, 1000);

  const FetchData = async () => {
    setLoader(true);

    //console.log(state.auth.auth.walletaddress, "walletaddress");
    try {
      const requestBody = {
        wallet_address: state.auth.auth.walletaddress,
      };
      const { data } = await axiosInstance
        .get("/api/stakehistory/getall")
        .catch((err) => {
          toast.error(err.message, {
            style: { minWidth: 180 },
            position: "top-center",
          });
          //console.log(err);
        });

      ////console.log(data);

      let temp = filterArray(
        data,
        moment(monthBack).format("YYYY-MM-DD") +
          " - " +
          moment(today).format("YYYY-MM-DD")
      );
      setRequests(temp.reverse());
      setdataMain(data);
      setStakeItems(data.filter((item) => item.type === "Stake"));
    } catch (err) {
      toast.error(err.message, {
        style: { minWidth: 180 },
        position: "top-center",
      });
    }
    setLoader(false);
  };

  useEffect(() => {
    FetchData();
  }, []);

  const { changeBackground } = useContext(ThemeContext);
  useEffect(() => {
    changeBackground({ value: "dark", label: "Dark" });
  }, []);

  const timer = (StartTime) => {
    const startTimeObject = new Date(StartTime);

    let string1 = "";
    const currentTime = new Date();
    const difference = currentTime - startTimeObject;
    const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    string1 = `${days}d ${hours}h ${minutes}m ${seconds}s `;

    return string1;
  };

  function handleCallback(start, end, label) {
    setdate(start.format("YYYY-MM-DD") + " - " + end.format("YYYY-MM-DD"));

    setRequests(
      filterArray(
        dataMain,
        start.format("YYYY-MM-DD") + " - " + end.format("YYYY-MM-DD")
      ).reverse()
    );
    onClick(0);
  }

  function filterArray(array, dateRange) {
    const [start, end] = dateRange.split(" - ");
    return array.filter((item) => {
      const itemDate = new Date(item.stake_time);
      //console.log(itemDate, "itemDate");
      //console.log(new Date(start), "start");
      //console.log(new Date(end), "end");

      //set end date to next day of end date

      const endDate = new Date(end);
      //endDate.setDate(endDate.getDate() + 1);
      //console.log(itemDate >= new Date(start) && itemDate <= new Date(end));
      return itemDate >= new Date(start) && itemDate <= new Date(endDate);
    });
  }

  return (
    <>
      <Toaster />

      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <Tab.Container defaultActiveKey="All">
              <div className="card-header border-0 pb-2 flex-wrap">
                <h4 className="heading">{t("stake_history")}</h4>

                <>
                  <Nav className="order nav nav-tabs">
                    <Nav.Link as="button" eventKey="All" type="button">
                      {t("staked")}
                    </Nav.Link>
                    <Nav.Link as="button" eventKey="Order" type="button">
                      {t("claimed")}
                    </Nav.Link>
                  </Nav>
                </>
                <DateRangePicker
                  initialSettings={{ startDate: monthBack, endDate: today }}
                  onCallback={handleCallback}>
                  <input type="text" className="form-control" />
                </DateRangePicker>
              </div>
              <div className="card-body pt-0 pb-0">
                <Tab.Content>
                  <Tab.Pane eventKey="All">
                    <div className="table-responsive dataTabletrade ">
                      <div
                        id="future_wrapper"
                        className="dataTables_wrapper no-footer">
                        <table
                          id="example"
                          className="table display dataTable no-footer"
                          style={{ minWidth: "845px" }}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>{t("wallet_address")}</th>
                              {/* <th>Block Hash</th> */}
                              <th>BXG </th>

                              <th>{t("date")} </th>
                              <th>{t("timer")}</th>

                              <th className="text-end">{t("status")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {}
                            {requests
                              ?.filter((item) => item.type === "Stake")
                              .map((item, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{item.wallet_address}</td>
                                  {/* <td>{item.blockhash}</td> */}
                                  <td>{item.bxg}</td>

                                  <td>{getFormattedDate(item.stake_time)}</td>
                                  <td>{timer(item.stake_time)}</td>

                                  <td className="text-end">
                                    <div className="bootstrap-badge">
                                      <Badge pill bg="warning">
                                        {t("staked")}
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                          {requests.filter((item) => item.type === "Stake")
                            ?.length > 0 ? (
                            <div className="dataTables_info">
                              {t("showing")} {activePag.current * sort + 1}{" "}
                              {t("to")}{" "}
                              {requests.filter((item) => item.type === "Stake")
                                .length >
                              (activePag.current + 1) * sort
                                ? (activePag.current + 1) * sort
                                : requests.filter(
                                    (item) => item.type === "Stake"
                                  ).length}{" "}
                              {t("of")}{" "}
                              {
                                requests.filter((item) => item.type === "Stake")
                                  .length
                              }{" "}
                              {t("entries")}
                            </div>
                          ) : (
                            <div className="dataTables_info">
                              {t("no_data_available")}
                            </div>
                          )}
                          <div
                            className="dataTables_paginate paging_simple_numbers mb-0"
                            id="application-tbl1_paginate">
                            <Link
                              className="paginate_button previous "
                              to="/admin-stake-history"
                              onClick={() =>
                                activePag.current > 0 &&
                                onClick(activePag.current - 1)
                              }>
                              <i className="fa fa-angle-double-left"></i>
                            </Link>
                            <span>
                              {paggination.map((number, i) => (
                                <Link
                                  key={i}
                                  to="/admin-stake-history"
                                  className={`paginate_button  ${
                                    activePag.current === i ? "current" : ""
                                  } `}
                                  onClick={() => onClick(i)}>
                                  {number}
                                </Link>
                              ))}
                            </span>

                            <Link
                              className="paginate_button next"
                              to="/admin-stake-history"
                              onClick={() =>
                                activePag.current + 1 < paggination.length &&
                                onClick(activePag.current + 1)
                              }>
                              <i className="fa fa-angle-double-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="Order">
                    <ClaimTab
                      //pass accepted requests data in props
                      to="/admin-stake-history"
                      acceptedData={requests.filter(
                        (item) => item.type === "claim"
                      )}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Tab.Container>
          </div>
        </div>
      </div>
    </>
  );
};
export default AdminStakeHistory;
