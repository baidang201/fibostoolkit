/**
 *
 * TransferForm
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'recompose';
import { withFormik } from 'formik';
import * as Yup from 'yup';

import Payment from '@material-ui/icons/Payment';

import Tool from 'components/Tool/Tool';
import ToolSection from 'components/Tool/ToolSection';
import ToolBody from 'components/Tool/ToolBody';

import FormObject from './FormObject';
import { makeSelectAccount } from '../../../containers/NetworkClient/selectors';

const makeTransaction = (values, account) => {
  const token = account.userTokens.find(
    userToken =>
      userToken.symbol === values.symbol &&
      userToken.account === values.issuer,
  );
  const transaction = [
    {
      account: 'eosio.token',
      name: 'exissue',
      data: {
        to: values.name,
        memo: values.memo,
        quantity: `${Number(values.quantity)
          .toFixed(token.precision)
          .toString()} ${values.symbol}@${values.issuer}`,
      },
    },
  ];
  return transaction;
};
const validationSchema = props => {
  return Yup.object().shape({
    name: Yup.string()
      .notOneOf(['huobideposit', 'binancecleos', 'gateiowallet', 'okbtothemoon'], `Can't transfer to blacklist account`)
      .required('Account name is required'),
    symbol: Yup.string().required('Symbol is required'),
    issuer: Yup.string().required('Issuer name is required'),
    memo: Yup.string(),
    quantity: Yup.number()
      .required('Quantity is required')
      .positive('You must send a positive quantity'),
  });
};

const SmartTokenIssueForm = props => {
  return (
    <Tool>
      <ToolSection lg={8}>
        <ToolBody color="warning" icon={Payment} header="Issue">
          <FormObject {...props} />
        </ToolBody>
      </ToolSection>
      <ToolSection lg={4}>
        <ToolBody color="info" header="Tutorial">
          <a
            href="https://dev.fo/zh-cn/guide/token-card.html#%E5%A2%9E%E5%8F%91%E6%99%AE%E9%80%9A%E9%80%9A%E8%AF%81"
            target="new"
          >
            Dev.fo Documentation
          </a>
        </ToolBody>
      </ToolSection>
    </Tool>
  );
};


const mapStateToProps = createStructuredSelector({
  account: makeSelectAccount(),
});

const enhance = compose(
  connect(
    mapStateToProps,
    null
  ),
  withFormik({
    handleSubmit: (values, { props, setSubmitting }) => {
      const { pushTransaction, account } = props;
      const transaction = makeTransaction(values, account);
      setSubmitting(false);
      pushTransaction(transaction, props.history);
    },
    mapPropsToValues: props => ({
      name: props.networkIdentity ? props.networkIdentity.name : '',
      symbol: '',
      issuer: '',
      quantity: '0',
      memo: '',
    }),
    validationSchema,
  })
);

export default enhance(SmartTokenIssueForm);
