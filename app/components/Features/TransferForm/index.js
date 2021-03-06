/**
 *
 * TransferForm
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectEosioTokens as selectTokens } from 'containers/NetworkClient/selectors';
import { compose } from 'recompose';
import { withFormik } from 'formik';
import * as Yup from 'yup';

import Payment from '@material-ui/icons/Payment';

import Tool from 'components/Tool/Tool';
import ToolSection from 'components/Tool/ToolSection';
import ToolBody from 'components/Tool/ToolBody';

import FormObject from './FormObject';

const makeTransaction = (values, eosioTokens) => {
  const token = eosioTokens.find(tk => tk.symbol === values.symbol);
  const transaction = [
    {
      account: 'eosio.token',
      name: 'transfer',
      data: {
        from: values.owner,
        to: values.name,
        memo: values.memo,
        quantity: `${Number(values.quantity)
          .toFixed(token.precision)
          .toString()} ${values.symbol}`,
      },
    },
  ];
  return transaction;
};
const validationSchema = props => {
  const { eosioTokens } = props;
  return Yup.object().shape({
    owner: Yup.string().required('Sender name is required'),
    name: Yup.string()
      .notOneOf(['huobideposit', 'binancecleos', 'gateiowallet', 'okbtothemoon'], `Can't transfer to blacklist account`)
      .required('Account name is required'),
    symbol: Yup.string()
      .required('Symbol is required')
      .oneOf(eosioTokens.map(token => token.symbol)),
    memo: Yup.string(),
    quantity: Yup.number()
      .required('Quantity is required')
      .positive('You must send a positive quantity'),
  });
};

const TransferForm = props => {
  return (
    <Tool>
      <ToolSection lg={8}>
        <ToolBody color="warning" icon={Payment} header="Transfer">
          <FormObject {...props} />
        </ToolBody>
      </ToolSection>
      <ToolSection lg={4}>
        <ToolBody color="info" header="Tutorial">
          <p>Tutorial coming soon</p>
        </ToolBody>
      </ToolSection>
    </Tool>
  );
};

const mapStateToProps = createStructuredSelector({
  eosioTokens: selectTokens(),
});

const enhance = compose(
  connect(
    mapStateToProps,
    null
  ),
  withFormik({
    handleSubmit: (values, { props, setSubmitting }) => {
      const { pushTransaction, eosioTokens } = props;
      const transaction = makeTransaction(values, eosioTokens);
      setSubmitting(false);
      pushTransaction(transaction, props.history);
    },
    mapPropsToValues: props => ({
      owner: props.networkIdentity ? props.networkIdentity.name : '',
      name: '',
      symbol: 'FO',
      quantity: '0',
      memo: '',
    }),
    validationSchema,
  })
);

export default enhance(TransferForm);
