import React from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  var displayContent = content();
  return (
    <div className="container">
      <p>CONTACT</p>
      <div className="card-table input-margin">
        <div className="row">
          <div className="col-md-1">
            <Link
              to="https://github.com/KPontes/simple-ether-wallet"
              target="_blank"
            >
              <img
                src="/images/github.png"
                height="40"
                width="40"
                alt=""
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="col-md-1">
            <Link to="mailto:simplepaywallet@gmail.com" target="_blank">
              <img
                src="/images/email.png"
                height="40"
                width="40"
                alt=""
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="col-md-1">
            <Link
              to="https://github.com/KPontes/simple-ether-wallet/wiki/FAQ"
              target="_blank"
            >
              <img
                src="/images/faq.png"
                height="40"
                width="40"
                alt=""
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="col-md-1">
            <Link
              to="https://www.linkedin.com/in/krishnanpontes/"
              target="_blank"
            >
              <img
                src="/images/linkedin.png"
                height="40"
                width="40"
                alt=""
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="col-md-1">
            <Link to="https://simplepaywallet.slack.com/" target="_blank">
              <img
                src="/images/slack.png"
                height="56"
                width="40"
                alt=""
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="col-md-2" />
          <div className="col-md-5">{displayContent}</div>
        </div>
      </div>
      <p />
    </div>
  );

  function content() {
    return (
      <div>
        <p>
          <small>For contracting refer to LinkedIn or send us an email.</small>
        </p>
        <p>
          {" "}
          <small>
            For development refer to source code on GitHub and to our Developers
            channel on Slack.
          </small>
        </p>
        <p>
          {" "}
          <small>
            For support check our FAQ or send us your issue on Slack.
          </small>
        </p>
        <p>
          <small>
            When making any donation, please let us know by sending an email or
            a message on slack.
          </small>
        </p>
      </div>
    );
  }
};

export default Contact;
