import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { ApolloClient, InMemoryCache } from "@apollo/client";

const CHAT_MESSAGES_QUERY = gql`
query chatMessages($id: ID!){
	chat(id: $id) {
		id
		messages {
			id
			owner {
				id
				fullName
			}
			text
		}
	}
}
`;

const PRODUCT_QUERY = gql`
    query getProduct($id: ID!){
        product(id: $id) {
            id
            owner {
                id
                fullName
            }
        }
    }
`;

const client = new ApolloClient({
	uri: 'http://5.45.118.116:3501/graphql',
	cache: new InMemoryCache({
		dataIdFromObject: o => o.id
	})
});

const App = () => {

	const [wait, setWait] = useState(true);

	const product = useQuery(PRODUCT_QUERY, {
		variables: { id: '0' }
	});

	const chatMessagesQuery = useQuery(CHAT_MESSAGES_QUERY, {
		variables: { id: '0' },
		skip: wait
	});

	useEffect(() => {
		setTimeout(() => {
			setWait(false);
		}, 2000);
	}, []);

	console.log(`Loading product: ${product.loading}\tLoading chat messages: ${chatMessagesQuery.loading}`);
	console.log(product.data); // << product.owner.id === 0, after loaded messages query, product.owner.id === 1
	console.log(chatMessagesQuery.data);

	return null;
}

ReactDOM.render(
	(
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	),
	document.getElementById('root')
);