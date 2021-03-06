import * as React from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import Button from "@material-ui/core/Button";
import { injectIntl, InjectedIntlProps } from "react-intl";
import * as Yup from "yup";

import FormikInputWrapper, {
  FieldTypes,
  Option
} from "../../FormikInputWrapper";
import CONFIGURATION, {
  FLOW,
  SystemConfiguration
} from "../../../backend/Configuration";
import messages from "../messages";

interface IProps extends SystemConfiguration, InjectedIntlProps {
  templateOptions: typeof CONFIGURATION["TEMPLATE_OPTIONS"];
  onSubmit: (config: SystemConfiguration) => void;
}

const SystemConfigurationStep = (props: IProps) => {
  const systemOptions: Option[] = [
    { value: FLOW.NEW, label: props.intl.formatMessage(messages.emptySystem) },
    {
      value: FLOW.EXISTING,
      label: props.intl.formatMessage(messages.existingSystem)
    },
    {
      value: FLOW.IPM,
      label: props.intl.formatMessage(messages.newSystemFromTemplate)
    }
  ];
  const { templateOptions } = props;
  return (
    <Formik
      validateOnBlur
      initialValues={
        {
          flow: props.flow,
          systemName: props.systemName,
          systemKey: props.systemKey,
          systemSecret: props.systemSecret,
          repoUser: props.repoUser,
          repoName: props.repoName,
          entrypoint: props.entrypoint
        } as SystemConfiguration
      }
      validationSchema={Yup.object().shape({
        systemName: Yup.string().when("flow", {
          is: FLOW.NEW,
          then: Yup.string().required(
            props.intl.formatMessage(messages.required)
          )
        }),
        systemKey: Yup.string().when("flow", {
          is: FLOW.EXISTING,
          then: Yup.string().required(
            props.intl.formatMessage(messages.required)
          )
        }),
        systemSecret: Yup.string().when("flow", {
          is: FLOW.EXISTING,
          then: Yup.string().required(
            props.intl.formatMessage(messages.required)
          )
        }),
        repoUser: Yup.string().when("flow", {
          is: FLOW.IPM,
          then: Yup.string().required(
            props.intl.formatMessage(messages.required)
          )
        }),
        repoName: Yup.string().when("flow", {
          is: FLOW.IPM,
          then: Yup.string().required(
            props.intl.formatMessage(messages.required)
          )
        })
      })}
      onSubmit={values => {
        props.onSubmit(values);
      }}
    >
      {({ handleSubmit, values }) => (
        <Form>
          <FormGroup>
            <FormControl component="fieldset">
              <Field
                name="flow"
                render={({ field, form }: FieldProps) => {
                  return (
                    <FormikInputWrapper
                      type={FieldTypes.RADIO_GROUP}
                      field={field}
                      form={form}
                      label=""
                      options={systemOptions}
                    />
                  );
                }}
              />
            </FormControl>
            {values.flow === FLOW.EXISTING && (
              <React.Fragment>
                <FormControl>
                  <Field
                    name="systemKey"
                    render={({ field, form }: FieldProps) => {
                      return (
                        <FormikInputWrapper
                          type={FieldTypes.TEXT}
                          field={field}
                          form={form}
                          label={props.intl.formatMessage(messages.systemKey)}
                        />
                      );
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Field
                    name="systemSecret"
                    render={({ field, form }: FieldProps) => {
                      return (
                        <FormikInputWrapper
                          type={FieldTypes.TEXT}
                          field={field}
                          form={form}
                          label={props.intl.formatMessage(
                            messages.systemSecret
                          )}
                        />
                      );
                    }}
                  />
                </FormControl>
              </React.Fragment>
            )}
            {values.flow === FLOW.NEW && (
              <FormControl>
                <Field
                  name="systemName"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <FormikInputWrapper
                        type={FieldTypes.TEXT}
                        field={field}
                        form={form}
                        label={props.intl.formatMessage(messages.systemName)}
                      />
                    );
                  }}
                />
              </FormControl>
            )}
            {values.flow === FLOW.IPM && (
              <FormControl>
                <Field
                  name="templateId"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <FormikInputWrapper
                        type={FieldTypes.SELECT}
                        options={templateOptions.map(t => ({
                          value: t.ID,
                          label: t.LABEL
                        }))}
                        field={{
                          ...field,
                          onChange: (e: React.ChangeEvent) => {
                            const template = templateOptions.find(
                              t => t.ID === (e.target as HTMLInputElement).value
                            );
                            if (template) {
                              form.setFieldValue(
                                "repoName",
                                template.IPM_REPO_NAME
                              );
                              form.setFieldValue(
                                "repoUser",
                                template.IPM_REPO_USER
                              );
                              form.setFieldValue(
                                "entrypoint",
                                template.IPM_ENTRYPOINT
                              );
                            }
                          }
                        }}
                        form={form}
                        label={props.intl.formatMessage(messages.password)}
                        inputProps={{
                          "data-cy": "system-template-id"
                        }}
                      />
                    );
                  }}
                />
              </FormControl>
            )}
            <FormControl>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onSubmit={handleSubmit}
                data-cy="continue"
              >
                Continue
              </Button>
            </FormControl>
          </FormGroup>
        </Form>
      )}
    </Formik>
  );
};

export default injectIntl(SystemConfigurationStep);
