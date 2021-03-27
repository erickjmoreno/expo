import { StackScreenProps } from '@react-navigation/stack';
import { AllStackRoutes } from 'navigation/Navigation.types';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import ProfileUnauthenticated from '../components/ProfileUnauthenticated';
import Account from '../containers/Account';
import getViewerUsernameAsync from '../utils/getViewerUsernameAsync';
import isUserAuthenticated from '../utils/isUserAuthenticated';

export default function AccountScreen({
  navigation,
  ...props
}: StackScreenProps<AllStackRoutes, 'Account'>) {
  const {
    isAuthenticated,
    accountName,
  }: { isAuthenticated: boolean; accountName?: string } = useSelector(
    React.useCallback(
      data => {
        const isAuthenticated = isUserAuthenticated(data.session);
        return {
          isAuthenticated,
          accountName: props.route.params?.accountName,
        };
      },
      [props.route]
    )
  );

  return (
    <AccountView
      {...props}
      isAuthenticated={isAuthenticated}
      accountName={accountName}
      navigation={navigation}
    />
  );
}

function AccountView(
  props: {
    accountName?: string;
    isAuthenticated: boolean;
  } & StackScreenProps<AllStackRoutes, 'Account'>
) {
  const [isCurrentUsersPersonalAccount, setIsCurrentUsersPersonalAccount] = React.useState<
    null | boolean
  >(null);

  const [accountName, setAccountName] = React.useState<string | undefined>(props.accountName);

  React.useEffect(() => {
    if (isCurrentUsersPersonalAccount !== null) {
      return;
    }

    if (!props.isAuthenticated) {
      // NOTE: this logic likely should be moved to a hook that runs whenever
      // the prop is updated
      setIsCurrentUsersPersonalAccount(false);
    } else {
      getViewerUsernameAsync().then(
        viewerUsername => {
          setIsCurrentUsersPersonalAccount(
            !!props.accountName && viewerUsername === props.accountName
          );

          if (!accountName && viewerUsername) {
            setAccountName(viewerUsername);
          }
        },
        error => {
          setIsCurrentUsersPersonalAccount(false);
          console.warn(`There was an error fetching the viewer's username`, error);
        }
      );
    }
  }, []);

  if (isCurrentUsersPersonalAccount === null) {
    return <View style={styles.loadingContainer} />;
  }

  if (!props.isAuthenticated && isCurrentUsersPersonalAccount) {
    return <ProfileUnauthenticated />;
  }

  return (
    <Account
      {...props}
      accountName={accountName!}
      isCurrentUsersPersonalAccount={isCurrentUsersPersonalAccount}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
  },
});
