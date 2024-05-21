use soroban_sdk::{contractimpl, Bytes, BytesN, Env, Symbol, Address, IntoVal, Map, Vec};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
struct HealthData {
    data_type: String,
    value: String,
    timestamp: u64,
}

#[derive(Clone, Serialize, Deserialize)]
struct DataConsent {
    researcher: Address,
    data_type: String,
    start_date: u64,
    end_date: u64,
}

pub struct HealthDataContract;

#[contractimpl]
impl HealthDataContract {
    pub fn submit_data(e: Env, owner: Address, data: HealthData) {
        let data_id = get_next_data_id(&e, &owner);
        e.data().set(data_id.clone(), data);
        let owner_data_key = owner_data_key(&owner);
        let mut owner_data: Vec<Bytes> = e.data().get(owner_data_key.clone()).unwrap_or(Vec::new(&e));
        owner_data.push(data_id);
        e.data().set(owner_data_key, owner_data);
    }

    pub fn grant_consent(e: Env, owner: Address, consent: DataConsent) {
        let consent_key = get_consent_key(&owner, &consent);
        e.data().set(consent_key, consent);
    }

    pub fn request_data(e: Env, researcher: Address, data_id: Bytes) -> HealthData {
        let owner = get_data_owner(&e, &data_id);
        let consent = consent_for(&e, &researcher, &data_id);
        let consent_key = get_consent_key(&owner, &consent);

        if e.data().get::<DataConsent>(consent_key).is_ok() {
            invoke_token_contract(&e, &owner, 10);
            e.data().get::<HealthData>(data_id).unwrap().unwrap()
        } else {
            panic!("Access denied");
        }
    }
}

fn get_next_data_id(e: &Env, owner: &Address) -> Bytes {
    let owner_data_key = owner_data_key(owner);
    let owner_data: Vec<Bytes> = e.data().get(owner_data_key).unwrap_or(Vec::new(e));
    let next_id = owner_data.len();
    Bytes::from(next_id.to_be_bytes())
}

fn get_data_owner(e: &Env, data_id: &Bytes) -> Address {
    let all_data: Map<Address, Vec<Bytes>> = e.data().get_map().unwrap_or_default();
    for (owner, data_ids) in all_data.iter() {
        if data_ids.contains(data_id) {
            return owner;
        }
    }
    panic!("Owner not found");
}

fn get_consent_key(owner: &Address, consent: &DataConsent) -> Bytes {
    let key = format!("{}_{}_{}_{}", owner, consent.researcher, consent.data_type, consent.start_date);
    Bytes::from(key)
}

fn consent_for(e: &Env, researcher: &Address, data_id: &Bytes) -> DataConsent {
    let data: HealthData = e.data().get(data_id).unwrap().unwrap();
    DataConsent {
        researcher: researcher.clone(),
        data_type: data.data_type.clone(),
        start_date: 0, // Set appropriate start date
        end_date: u64::MAX, // Set appropriate end date
    }
}

fn invoke_token_contract(e: &Env, to: &Address, amount: i32) {
    let token_contract = e.contract("TokenContract").unwrap();
    let tx = token_contract.invoke("transfer", &to, &amount).unwrap();
    let token_contract_address = Address::from("TOKEN_CONTRACT_ADDRESS");
    let token_contract = e.contract(token_contract_address);
    let method = Symbol::from_str("transfer");
    e.invoke_contract(&token_contract_address, &method, (to.clone(), amount).into_val(e));
}

fn owner_data_key(owner: &Address) -> Bytes {
    let key = format!("{}_data", owner);
    Bytes::from(key)

}
