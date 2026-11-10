import QueryErrorState from "../shared/components/QueryErrorState";
import useProviderDetailsText from "./useProviderDetailsText";

export default function ProviderDetailsQueryErrorState({ localized = true, ...props }) {
  const tr = useProviderDetailsText(localized);
  return (
    <QueryErrorState
      {...props}
      loadErrorMessage={tr("We couldn't load the data. Please try again.")}
      connectionErrorMessage={tr("We couldn't connect to the server. Please check your internet connection and try again.")}
      retryLabel={tr("Try Again")}
    />
  );
}
